import 'angular-sanitize'

const url = '/api/search_api/global_search_index'
const fields = 'title,field_preview,excerpt,score,typestr'

const app = angular.module('search-results', ['ngSanitize'])

app.controller('ctrl', function($scope, $http) {

	$scope.query = decodeURI(window.location.pathname.replace(/\/search\//, ''))

	$http({
		url: url,
		method: 'GET',
		params: {
			keys: $scope.query,
			fields: fields
		}
	}).then(function(res) {
		$scope.results =
			Object.keys(res.data.result)
			.map((k) =>
				res.data.result[k])
			.sort((a,b) =>
				b.score - a.score)
			.map((v) =>
				Object.assign(v, {
					imageUrl: v.field_preview.und ? v.field_preview.und[0].thumbnail : ''
				}))
	})

})