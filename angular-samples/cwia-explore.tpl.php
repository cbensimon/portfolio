<script>require('explore')</script>

<div id="explore">
	<div class="filters">
		<div
			class="filter {{filter.name}}"
			ng-class="{active: filter.active}"
			ng-repeat="filter in model.filters">
			<h1>{{filter.name}}</h1>
			<div class="clear-all-button" query-link="{{filter.clear_query}}">
				<span></span>
			</div>
			<div class="loading"></div>
			<ul class="content">
				<div class="clear-all" query-link="{{filter.clear_query}}">
					<span>clear all</span>
				</div>
				<div class="filter-items">
					<li ng-repeat="item in filter.items">
						<a
							href="{{item.query | url }}"
							query-link="{{item.query}}"
							ng-class="{active: item.active}">
							{{item.name}}
						</a>
					</li>
				</div>
			</ul>
		</div>
	</div>
	<div class="items-container">
		<div
			class="item"
			ng-repeat="item in model.items | limitTo:limit"
			ng-style="{'background-image': 'url({{item.imageUrl}})'}">
			<a href="{{item.path}}">
				<div
					class="tablet-image"
					ng-style="{'background-image': 'url({{item.imageUrl}})'}">
				</div>
				<div class="overlay">
					<div>
						<h1>{{item.title}}</h1>
						<h2>{{item.edition}}</h2>
						<h3>{{item.region}}</h3>
					</div>
				</div>
			</a>
		</div>
	</div>
	<a
		class="white-button"
		ng-click="limit = limit + 15"
		ng-show="limit <= (model.items.length + 1)">
		Load More
	</a>
</div>