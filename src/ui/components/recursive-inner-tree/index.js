import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { connect } from 'react-redux';
import { join as joinPaths } from 'path';

import { readFile } from 'lib/io';
import { createPane } from 'ui/state/actions';
import { listContents } from 'ui/utils';
import css from './styles.css';

const cx = classnames.bind(css);

export class RecursiveInnerTree extends Component {
  static defaultProps = {
    directories: [],
    files: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      directories: props.directories,
      files: props.files,
    };
  }

  componentDidMount() {
    this.loadPath(this.props.path);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.path !== this.props.path) {
      this.loadPath(nextProps.path);
    }
  }

  loadPath = path => {
    return listContents(path).then(results => {
      this.setState({ ...results });
    });
  };

  toggleDirectory = directory => event => {
    event.stopPropagation();
    if (this.state[directory]) {
      this.setState({ [directory]: null });
    } else {
      return listContents(joinPaths(this.props.path, directory)).then(
        results => {
          this.setState({ [directory]: results });
        },
      );
    }
  };

  openFile = file => event => {
    event.stopPropagation();
    const fileName = joinPaths(this.props.path, file);
    return readFile(fileName, { encoding: 'utf-8' }).then(text => {
      this.props.createPane(fileName, text);
    });
  };

  render() {
    const right = cx('triangle', 'right');
    const down = cx('triangle', 'down');
    return (
      <div className={css.root}>
        {this.state.directories.map(directory => (
          <div key={directory}>
            <span
              className={css.directory}
              onMouseDown={this.toggleDirectory(directory)}
              title={directory}
            >
              <span className={this.state[directory] ? down : right} />
              {`${directory}/`}
            </span>
            {this.state[directory] && (
              <RecursiveInnerTree
                path={joinPaths(this.props.path, directory)}
                createPane={this.props.createPane}
              />
            )}
          </div>
        ))}
        {this.state.files.map(file => (
          <div key={file}>
            <span
              className={css.file}
              onMouseDown={this.openFile(file)}
              title={file}
            >
              {file}
            </span>
          </div>
        ))}
      </div>
    );
  }
}

RecursiveInnerTree.propTypes = {
  createPane: PropTypes.func.isRequired,
  directories: PropTypes.array,
  files: PropTypes.array,
  path: PropTypes.string.isRequired,
};

export default connect(null, { createPane })(RecursiveInnerTree);
