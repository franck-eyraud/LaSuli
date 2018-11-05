/*global browser */
import React from 'react';
import ReactDOM from 'react-dom';

import Whitelist from './jsx/Whitelist.jsx';
import Display from './jsx/Display.jsx';
import Error from './jsx/Error.jsx';

import Resource from '../backgroundScripts/Resource.js';

class Sidebar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			uri: '',
			status: 'waiting'
		};
	}

	componentDidMount() {
		// Listen to browser events for this window
		browser.windows.getCurrent({populate: true}).then((windowInfo) => {
			this.windowId = windowInfo.id;
			browser.tabs.query({
				windowId: this.windowId,
				active: true
			}).then(tabs => {
				let tab = tabs[0];
				this._updateContent(tab.id);
			});
		});

		browser.tabs.onActivated.addListener((tab) => this._updateContent(tab.tabId));
		browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
			if (tabId == this.state.tabId && changeInfo.status === 'complete') {
				this._updateContent(tabId);
			}
		});
	}

	render() {
		return <div>
			{this.getContent(this.state.status)}
		</div>;
	}

	getContent(status) {
		if (status === 'unknown') {
			// URI is unknown (not in the whitelist)
			return <Whitelist uri={this.state.uri} />;
		} else if (status === 'display') {
			// Show the highlights
			return <Display uri={this.state.uri} res={this.res} tabId={this.state.tabId} />;
		} else if (status === 'error') {
			return <Error err={this.state.error} uri={this.state.uri} />;
		}
		return 'Waiting…'; // Waiting for the highlights
	}

	async _updateContent(tabId) {

		let tab=await browser.tabs.get(tabId);
		if (!tab) return;
		let uri = tab.url;
		let status;

		let isWhitelisted = await browser.runtime.sendMessage({
			aim: 'isWhitelisted',
			uri: uri
		});
		status = isWhitelisted ? 'waiting' : 'unknown';

		this.setState({uri, status, tabId});

		if (!isWhitelisted) {
			return;
		}

		let res = await browser.runtime.sendMessage({
			aim: 'getResource',
			uri: uri,
			reload: false
		}).catch((error) => {
			status = 'error';
			this.setState({uri, status, error, tabId});
		});

		if (res && res.viewpoints) {
			status = 'display';
			this.res = new Resource(res);
			this.setState({uri, status, tabId});
		}
	}
}

const panel = document.getElementById('panel');
ReactDOM.render(<Sidebar />, panel);
