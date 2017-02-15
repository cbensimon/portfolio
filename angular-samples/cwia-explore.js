const browserPath = '/explore'
const urlPrefix = '/api/search_api/candidate_index?'
const urlSuffix = 'fields=nid,title,field_edition,field_region,field_is_laureate,field_preview'

const app = angular.module('explore', [])

app.factory('routing', ['$rootScope', '$http', function($scope, $http) {

	function goTo(query) {
		if (query.length)
			query = 'facets_path='+ query +'&'
		$http.get(urlPrefix + query + urlSuffix)
			.success(function(data) {
				$scope.model = handleData(data)
				$scope.limit = 15
			})
	}

	function routeTo(query) {
		window.history.pushState({query: query}, '', browserPath + query)
		goTo(query)
	}

	function topStories() {
		$http.get('/api/stories-quickview')
			.success(function(data) {
				$scope.topStories = data
			})
	}

	return {
		goTo: goTo,
		routeTo: routeTo,
		topStories: topStories
	}

}])

app.run(['routing', function(routing) {

	const query = window.location.pathname.match(/\/explore\/?(.*)$/)[1]
	window.history.replaceState({query: query}, '', window.location.pathname)
	routing.goTo(query)
	routing.topStories()

	window.onpopstate = function(event) {
		routing.goTo(event.state.query)
	}

}])

app.directive('queryLink', ['routing', function(routing) {
	return function($scope, $elem) {
		$elem.on('click', function(e) {
			e.preventDefault()
			routing.routeTo(this.getAttribute('query-link'))
		})
	}
}])

app.filter('url', function() {
	return function(query) {
		return browserPath + query
	}
})

$(function() {

	const $explore = $('#explore')

	$explore
		.on('click', '.filter h1', function() {
			const $filter = $(this).parent()
			if ($filter.hasClass('opened')) {
				$filter.removeClass('opened')
			} else {
				$filter.siblings().removeClass('opened')
				$filter.addClass('opened')
				$filter.find('.filter-items').jScrollPane()
			}
		})
		.on('click', '.filter [query-link]', function() {
			$(this).closest('.filter').addClass('loading')
		})
		.on('click', '.filter', function(e) {
			e.stopPropagation()
		})

	$(document).click(function() {
		$explore.find('.filter').removeClass('opened')
	})

})

function handleData(data) {
	
	function handleFilter(facets, field, name) {

		var filter = {
			name: name,
			items: []
		}

		const facet = facets[field]

		for (var index in facet) {
			var item = facet[index]._facet
			if (index == 'all') {
				filter.active = item['#active'] != 1
				filter.clear_query = item['#path']
			} else {
				filter.items.push({
					position: item['#position'],
					name: item['#markup'],
					active: item['#active'] == 1,
					query: item['#path']
				})
				filter.items.sort((a,b) => a.position - b.position)
			}
		}

		return filter
	}

	function handleItems(result) {

		var items = []

		for (var index in result) {
			const d = result[index]
			var editionLabel = 'finalist '
			if (d.field_is_laureate.und && d.field_is_laureate.und['0'].value == "1")
				editionLabel = 'laureate '
			items.push({
				title: d.title,
				imageUrl: d.field_preview.und ? d.field_preview.und['0'].thumbnail : '',
				edition: d.field_edition.und ? editionLabel + d.field_edition.und['0'].name : '',
				region: d.field_region.und ? d.field_region.und['0'].name : '',
				path: d.path
			})
		}

		return items
	}

	function shuffle(o) {
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}

	const filters = [
		handleFilter(data.facets, 'field_domain', 'industry'),
		handleFilter(data.facets, 'field_region', 'region'),
		handleFilter(data.facets, 'field_is_laureate', 'entrepreneurs'),
		handleFilter(data.facets, 'field_edition', 'year')
	]

	const items = handleItems(data.result)

	return {
		filters: filters,
		items: shuffle(items)
	}
}