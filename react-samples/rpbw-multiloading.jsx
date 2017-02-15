import React from 'react'
import Loading from './Loading'
import $ from 'jquery'

export default class MultiLoading extends React.Component {
	constructor(props) {
		super()
		this.state = {
			limit: props.limit
		}
		this.onScroll = this.onScroll.bind(this)
	}
	render() {

		var newProps = Object.assign({}, this.props)
		delete newProps.limit
		delete newProps.step
		delete newProps.thresholdTime

		var $children = this.props.children
		if (Array.isArray(this.props.children)) {
			$children = this.props.children.slice(0,this.state.limit)
			if (this.state.limit < this.props.children.length)
				$children.push(<Loading key={parseInt(Math.random()*100000)} />)
		}

		return React.createElement(
			'div',
			newProps,
			$children
		)
		
	}
	onScroll() {
		if (document.body.offsetHeight != this.oldBodyOffsetHeight) {
			this.oldBodyOffsetHeight = document.body.offsetHeight
			return
		}
		if (this.state.limit >= this.props.children.length)
			return
		if (window.innerHeight + $(window).scrollTop() >=
			document.body.offsetHeight - this.$footer.outerHeight()) {
			if (this.bottomTimeout)
				return
			this.bottomTimeout = setTimeout(() => {
				this.setState({
					limit: this.state.limit + this.props.step
				}, () => this.bottomTimeout = null)
			}, this.props.thresholdTime)
		} else {
			clearTimeout(this.bottomTimeout)
			this.bottomTimeout = null
		}
	}
	componentDidMount() {
		$(() => this.$footer = $('#footer'))
		window.oldBodyOffsetHeight = document.body.offsetHeight
		window.addEventListener('scroll', this.onScroll)
	}
	componentWillUnmount() {
		window.removeEventListener('scroll', this.onScroll)
	}
	componentWillReceiveProps(props) {
		if (this.props.children != props.children) {
			this.setState({
				limit: this.props.limit
			})
		}
	}
}

MultiLoading.defaultProps = {
	limit: 15,
	step: 15,
	thresholdTime: 1000
}