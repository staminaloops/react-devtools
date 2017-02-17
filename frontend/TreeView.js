/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

var Breadcrumb = require('./Breadcrumb');
var Node = require('./Node');
var React = require('react');

import type {DOMNode} from './types';

var decorate = require('./decorate');

var MAX_SEARCH_ROOTS = 200;

class TreeView extends React.Component {
  node: ?DOMNode;

  getChildContext() {
    return {
      scrollTo: this.scrollTo.bind(this),
    };
  }

  scrollTo(val, height) {
    if (!this.node) {
      return;
    }
    var top = this.node.scrollTop;
    var rel = val - this.node.offsetTop;
    var margin = 40;
    if (top > rel - margin) {
      this.node.scrollTop = rel - margin;
    } else if (top + this.node.offsetHeight < rel + height + margin) {
      this.node.scrollTop = rel - this.node.offsetHeight + height + margin;
    }
  }

  render() {
    // TODO(sofia): clear this
    //console.log('pinnedNodes', this.props.pinnedNodes ? this.props.pinnedNodes.toJS() : this.props.pinnedNodes)
    //console.log('roots', this.props.roots.toJS())
    if (!this.props.roots.count()) {
      if (this.props.searching) {
        return (
          <div style={styles.container}>
            <div ref={n => this.node = n} style={styles.scroll}>
              <div style={styles.scrollContents}>
                { this.props.pinnedNodes &&
                <div>
                  <div>Pinned</div>
                  { this.props.pinnedNodes.map(id => (
                    <Node key={id} id={id} depth={0} />
                  )).toJS() }
                  <div>Root</div>
                </div> }
              </div>
            </div>
            <span>No search results</span>
          </div>
        );
      } else {
        return (
          <div style={styles.container}>
            <div ref={n => this.node = n} style={styles.scroll}>
              <div style={styles.scrollContents}>
              { this.props.pinnedNodes &&
              <div>
                <div>Pinned</div>
                { this.props.pinnedNodes.map(id => (
                  <Node key={id} id={id} depth={0} />
                )).toJS() }
                <div>Root</div>
              </div> }
              Waiting for roots to load...
              {this.props.reload &&
                <span>
                  to reload the inspector <button onClick={this.props.reload}> click here</button>
                </span>}
              </div>
            </div>
          </div>
        );
      }
    }

    if (this.props.searching && this.props.roots.count() > MAX_SEARCH_ROOTS) {
      return (
        <div style={styles.container}>
          <div ref={n => this.node = n} style={styles.scroll}>
            <div style={styles.scrollContents}>
              { this.props.pinnedNodes &&
              <div>
                <div>Pinned</div>
                { this.props.pinnedNodes.map(id => (
                  <Node key={id} id={id} depth={0} />
                )).toJS() }
                <div>Root</div>
              </div> }
              {this.props.roots.slice(0, MAX_SEARCH_ROOTS).map(id => (
                <Node key={id} id={id} depth={0} />
              )).toJS()}
              <span>Some results not shown. Narrow your search criteria to find them</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div ref={n => this.node = n} style={styles.scroll}>
          <div style={styles.scrollContents}>
            { this.props.pinnedNodes &&
            <div>
              <div>Pinned</div>
              { this.props.pinnedNodes.map(id => (
                <Node key={id} id={id} depth={0} />
              )).toJS() }
              <div>Root</div>
            </div> }
            {this.props.roots.map(id => (
              <Node key={id} id={id} depth={0} />
            )).toJS()}
          </div>
        </div>
        <Breadcrumb />
      </div>
    );
  }
}

TreeView.childContextTypes = {
  scrollTo: React.PropTypes.func,
};

var styles = {
  container: {
    fontFamily: 'Menlo, Consolas, monospace',
    fontSize: '11px',
    lineHeight: 1.3,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,

    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    userSelect: 'none',
  },

  scroll: {
    padding: '3px 0',
    overflow: 'auto',
    minHeight: 0,
    flex: 1,
    display: 'flex',
    alignItems: 'flex-start',
  },

  scrollContents: {
    flexDirection: 'column',
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
  },
};

var WrappedTreeView = decorate({
  listeners(props) {
    return ['searchRoots', 'roots', 'pinnedNodes'];
  },
  props(store, props) {
    return {
      roots: store.searchRoots || store.roots,
      searching: !!store.searchRoots,
      pinnedNodes: store.pinnedNodes,
    };
  },
}, TreeView);

module.exports = WrappedTreeView;
