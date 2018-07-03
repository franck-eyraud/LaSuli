/*global browser */
import React from 'react';
import Viewpoint from './Viewpoint.jsx';
import Topic from './Topic.jsx';

export default class Display extends React.Component {
	constructor(props) {
		super(props);
		this.state = {vp: null};
	}

	render() {
		let title, list;
		let vp = this.state.vp;
		let coll = (vp || this.props.res);
		let labels = coll.getLabels();

		if (vp && vp.topics) {
			title = vp.name;
			list = this._getTopics(labels);
		} else {
			title = 'Points de vue';
			list = this._getViewpoints(labels);
		}
		this._highlight(labels, coll.getFragments());
		return (<div>
			<h1>{title}</h1>
			{vp && vp.topics && this._getButton()}
			{list}
		</div>);
	}

	async _highlight(labels, fragments) {
		let tab = await this._loadScript();
		await browser.tabs.sendMessage(tab.id, {
			aim: 'showHighlights',
			labels,
			fragments
		});
	}

	async _loadScript() {
		let tabs = browser.tabs;
		let tab = (await tabs.query({active: true}))[0];
		await tabs.sendMessage(tab.id, {aim: 'isLoaded'})
			.catch(async () => {
				await tabs.executeScript(tab.id, {
					file: '/dist/content.js'
				});
			});
		return tab;
	}

	_getViewpoints(labels) {
		return Object.keys(this.props.res.viewpoints).map(id => {
			let vp = this.props.res.viewpoints[id];
			let vpDetails = this._vpDetails.bind(this, vp);
			return <Viewpoint key={id} details={vp} onClick={vpDetails}
				color={labels[id].color} />;
		});
	}

	_getTopics(labels) {
		return Object.keys(this.state.vp.topics).map(id =>
			<Topic details={this.state.vp.topics[id]}
				color={labels[id].color} />
		);
	}

	_getButton() {
		let back = () => this.setState({vp: null});
		return <button class="btn btn-back" onClick={back}>
			Retour aux points de vue
		</button>;
	}

	_vpDetails(vp) {
		this.setState({vp: vp});
	}
}
