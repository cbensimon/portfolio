import React from 'react'
import api from '../api'
import Gallery from './Gallery'
import ProjectPreview from './Project-preview'
import MultiLoading from './MultiLoading'
import classNames from 'classnames'
import $ from 'jquery'
import Slider from './Slider'
import { Link } from 'react-router'

const YEAR_MIN = 0
const YEAR_MAX = 3000

const defaultState = {
	mobileMode: false,
	searchQuery: '',
	projects: [],
	people: null,
	filtersTabOpen: false,
	status: [],
	filters: null,
	year_min: YEAR_MIN,
	year_max: YEAR_MAX,
	regions: [],
	types: []
}

export default class PageAllProjects extends React.Component {
	constructor() {
		super()
		this.state = defaultState
		this.mobileDetect = this.mobileDetect.bind(this)
	}
	render() {

		var projects = this.state.projects

		const filters = this.state.filters
		var $filters
		var $filtersTab
		var $activeFilters
		var filtering = {}

		if (filters) {

			// Text search
			if (this.state.mobileMode && this.state.searchQuery.length >= 3) {

				var keywords = this.state.searchQuery.trim().toLowerCase().split(/\s+/)

				projects.forEach(project => {
					var score = 1
					keywords.forEach(keyword => {
						score *= project.fullString.split(keyword).length - 1
					})
					project.score = score
				})

				projects = projects
					.filter(v => v.score)
					.sort((a,b) => b.score - a.score)

			}

			// Year filtering
			if (this.state.year_min != filters.year.min || this.state.year_max != filters.year.max) {
				filtering.year = true
				projects = projects
					.filter( v => v.begin >= this.state.year_min && v.begin <= this.state.year_max)
					.filter( v => !v.end || isNaN(v.end) || v.end <= this.state.year_max && v.end >= this.state.year_min)
			}

			// Status filtering
			const status_ids = this.state.status
				.filter( v => v.checked )
				.map( v => v.id )
			if (status_ids.length) {
				filtering.status = true
				projects = projects
					.filter( v => v.status )
					.filter( v => status_ids.indexOf(v.status.toLowerCase()) != -1 )
			}

			// Region filtering
			const region_ids = this.state.regions
				.filter( v => v.checked )
				.map( v => v.id )
			if (region_ids.length) {
				filtering.region = true
				projects = projects
					.filter( v => v.region )
					.filter( v => region_ids.indexOf(v.region.sys.id) != -1 )
			}

			// Type filtering
			const type_ids = this.state.types
				.filter( v => v.checked )
				.map( v => v.id )
			if (type_ids.length) {
				filtering.type = true
				projects = projects
					.filter( v => v.projectTypes )
					.filter( v => v.projectTypes.filter( type => type_ids.indexOf(type.sys.id) != -1 ).length )
			}

			$filters = (
				<div id="filters">
					<div className="filter">
						<h1>region</h1>
						<div className="checkbox-group">
						{this.state.regions.map((region, i) => {
							return (
							<div className="checkbox-container" key={i}>
								<input
									type="checkbox"
									id={`region-${region.name}`}
									checked={region.checked}
									onChange={() => {
										region.checked = !region.checked
										this.forceUpdate()
									}} />
								<label htmlFor={`region-${region.name}`}>
									<span>{region.name}</span>
								</label>
							</div>
							)
						})}
						</div>
					</div>
					<div className="filter mobile-only">
						<h1>Search in projects</h1>
						<input
							type="text"
							placeholder="type keywords"
							onChange={this.onChangeSearch.bind(this)} />
					</div>
					<div className="filter mobile-enabled">
						<h1>year</h1>
						<Slider
							min={filters.year.min}
							max={filters.year.max}
							value={[this.state.year_min, this.state.year_max]}
							onChange={this.onChangeYear.bind(this)} />
					</div>
					<div className="filter mobile-enabled">
						<h1 className="mobile-hide">status</h1>
						<div className="checkbox-group">
						{this.state.status.map((status, i) => {
							return (
							<div className="checkbox-container" key={i}>
								<input
									type="checkbox"
									id={`status-${status.name}`}
									checked={status.checked}
									onChange={() => {
										status.checked = !status.checked
										this.forceUpdate()
									}} />
								<label htmlFor={`status-${status.name}`}>
									<span>{status.name}</span>
								</label>
							</div>
							)
						})}
						</div>
					</div>
					<div className="filter">
						<h1>type</h1>
						<div className="checkbox-group">
						{this.state.types.map((type, i) => {
							return (
							<div className="checkbox-container" key={i}>
								<input
									type="checkbox"
									id={`type-${type.name}`}
									checked={type.checked}
									onChange={() => {
										type.checked = !type.checked
										this.forceUpdate()
									}} />
								<label htmlFor={`type-${type.name}`}>
									<span>{type.name}</span>
								</label>
							</div>
							)
						})}
						</div>
					</div>
					<div
						className="arrow-button arrow-button-blue"
						onClick={() => this.setState({filtersTabOpen: false})}>
						<span>See all projects</span>
					</div>
				</div>
			)

			$filtersTab = (
				<div id="filters-tab" className={classNames({'open': this.state.filtersTabOpen})}>
					<div className="filters-tab-button-container">
						<div id="filters-tab-button" className="header-button active" onClick={this.filtersTabOpenClose.bind(this)}>
							<div className="menu-font">
								<span className="text-open">go to filters</span>
								<span className="text-close">filters</span>
							</div>
						</div>
					</div>
					{$filters}
				</div>
			)

			if (Object.values(filtering).filter(v => v).length)
				$activeFilters = (
					<div className="active-filters-part">
						<div className="active-filters-container">
							<div className="active-filters">
								{this.state.regions.filter( v => v.checked ).map( (region, i) => {
									return (
										<div
											key={i}
											className="active-filter"
											onClick={() => {
												region.checked = !region.checked
												this.forceUpdate()
											}}>
											<span>{region.name}</span>
										</div>
									)
								})}
								{filtering.year ? (
									<div
										className="active-filter"
										onClick={() => this.setState({
											year_min: this.state.filters.year.min,
											year_max: this.state.filters.year.max
										})}>
										<span>{this.state.year_min} - {this.state.year_max}</span>
									</div>
								) : null}
								{this.state.status.filter( v => v.checked ).map( (status, i) => {
									return (
										<div
											key={i}
											className="active-filter"
											onClick={() => {
												status.checked = !status.checked
												this.forceUpdate()
											}}>
											<span>{status.name}</span>
										</div>
									)
								})}
								{this.state.types.filter( v => v.checked ).map( (type, i) => {
									return (
										<div
											key={i}
											className="active-filter"
											onClick={() => {
												type.checked = !type.checked
												this.forceUpdate()
											}}>
											<span>{type.name}</span>
										</div>
									)
								})}
							</div>
						</div>
						<h2>{projects.length} project{projects.length > 1 ? 's' : ''} found</h2>
						<button onClick={() => this.setState({
							year_min: this.state.filters.year.min,
							year_max: this.state.filters.year.max,
							status: this.state.status.map( v => Object.assign(v, {checked: false})),
							regions: this.state.regions.map( v => Object.assign(v, {checked: false})),
							types: this.state.types.map( v => Object.assign(v, {checked: false}))
						})}>
							<span>clear all</span>
						</button>
					</div>
				)

		} else if (this.state.people) {

			$activeFilters = (
				<div className="active-filters-part active-filters-part-people">
					<div className="active-filters-container">
						<div className="active-filters">
							<Link to="/all-projects" className="active-filter">
								<span>{this.state.people.name}</span>
							</Link>
						</div>
					</div>
					<h2>{projects.length} project{projects.length > 1 ? 's' : ''} found</h2>
				</div>
			)
		}

		return (
		<div id="page">
			<div id="page-title">
				<Link to="/">
					<h1>RPBW</h1>
				</Link>
				<h2>All projects</h2>
			</div>
			<div id="page-content">
				<div id="projects-page">
					{$filtersTab}
					{$activeFilters}
					<div className="projects-container">
						<MultiLoading className="projects" thresholdTime={500}>
						{projects.map((project, i) => {
							if (this.state.mobileMode) {
								return (
									<ProjectPreview
										key={project.id}
										data={project}
										pid={project.id}
										all-projects={true}
									/>
								)
							}
							return (
								<Link
									to={`/project/${project.slug}`}
									className="project-item"
									key={project.id}>
									<div className="project-item-image">
										<Gallery
											medias={project.slideshow ? [project.slideshow.mediaList[0]] : undefined} />
									</div>
									<h1 className="subtitle">{project.name}</h1>
									<h2 className="subtitle">{project.country.fields.name}</h2>
								</Link>
							)
						})}
						</MultiLoading>
					</div>
				</div>
			</div>
		</div>
		)
	}
	filtersTabOpenClose() {
		this.setState({
			filtersTabOpen: !this.state.filtersTabOpen
		})
	}
	loadData(props) {

		this.state = defaultState

		if (props.params.peopleSlug) {

			api.getEntries({
				content_type: 'people',
				'fields.slug': props.params.peopleSlug,
				include: 2
			}).then((entries) => {
				const people = entries.items[0]
				this.setState({
					projects: people.fields.projects.map( v => Object.assign(v.fields, {id: v.sys.id}) ),
					people: people.fields
				})
			})

			return

		}

		api.getEntries({
			'content_type': 'page',
			'fields.systemName': 'all_projects',
			include: 2
		}).then((entries) => {
			this.setState({
				projects: entries.items[0].fields.elements.map( v => Object.assign(v.fields, {id: v.sys.id}) )
			}, () => {
				this.initFilters()
				this.createIndex()
			})
		})

		this.setState({
			status: [{
				name: 'Completed',
				id: 'completed',
				checked: false
			}, {
				name: 'Ongoing',
				id: 'ongoing',
				checked: false
			}]
		})

		api.getEntries({
			'content_type': 'region'
		}).then(entries => {
			this.setState({
				regions: entries.items.map(item => {
					return {
						name: item.fields.name.toLowerCase(),
						id: item.sys.id,
						checked: false
					}
				})
			})
		})

		api.getEntries({
			'content_type': 'projectType'
		}).then(entries => {
			this.setState({
				types: entries.items.map(item => {
					return {
						name: item.fields.name.toLowerCase(),
						id: item.sys.id,
						checked: false
					}
				})
			})
		})

	}
	initFilters() {
		const filters = {}
		filters.year = {}
		filters.year.min = this.state.projects
			.map(v => parseInt(v.begin) || YEAR_MAX)
			.reduce((a1,a2) => Math.min(a1,a2), YEAR_MAX)
		filters.year.max = new Date().getFullYear()

		this.setState({
			filters: filters,
			year_min: filters.year.min,
			year_max: filters.year.max
		})
	}
	createIndex() {
		this.state.projects.forEach(project => {
			var projectTypes
			if (project.projectTypes) {
				projectTypes = project.projectTypes
					.map(v => v.fields.name)
					.join(' ')
			}
			project.fullString = [
				project.name,
				project.city ? project.city.fields.name : '',
				project.country ? project.country.fields.name : '',
				project.region ? project.region.fields.name : '',
				project.begin,
				projectTypes
			].join(' ').toLowerCase()
		})
	}
	onChangeSearch(e) {
		clearTimeout(this.searchTimeout)
		this.searchTimeout = (v => setTimeout(() => {
			this.setState({
				searchQuery: v
			})
		}, 1000))(e.target.value)
	}
	onChangeYear(v) {
		this.setState({
			year_min: v[0],
			year_max: v[1]
		})
	}
	componentDidMount() {
		this.mobileDetect()
		window.addEventListener('resize', this.mobileDetect)
		window.addEventListener('orientationchange', this.mobileDetect)
		this.loadData(this.props)
	}
	componentWillReceiveProps(props) {
		this.loadData(props)
		const pageName = props.params.peopleSlug ? '' : 'projects'
		window.Components.Header.setState({
			pageName: pageName
		})
	}
	componentWillMount() {
		const pageName = this.props.params.peopleSlug ? '' : 'projects'
		window.Components.Header.setState({
			pageName: pageName
		})
	}
	componentWillUnmount() {
		window.removeEventListener('resize', this.mobileDetect)
		window.removeEventListener('orientationchange', this.mobileDetect)
		window.Components.Header.setState({
			pageName: ''
		})
	}
	mobileDetect() {
		this.setState({
			mobileMode: $(window).width() < 768
		})
	}
}