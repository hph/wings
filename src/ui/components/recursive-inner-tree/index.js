import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import { join as joinPaths } from 'path';
import fs from 'fs-extra';

import { createView } from 'ui/state/actions';
import { listContents } from 'ui/utils';
import css from './styles.css';

const cx = classnames.bind(css);

class RecursiveInnerTree extends Component {
  static propTypes = {
    directories: PropTypes.array,
    dispatch: PropTypes.func.isRequired,
    files: PropTypes.array,
    path: PropTypes.string.isRequired,
  };

  static defaultProps = {
    directories: [],
    files: [],
  };

  constructor (props) {
    super(props);
    this.state = {
      directories: props.directories,
      files: props.files,
    };
  }

  componentDidMount () {
    this.loadPath(this.props.path);
  }

  componentWillReceiveProps (nextProps) {
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
      return listContents(joinPaths(this.props.path, directory))
        .then(results => {
          this.setState({ [directory]: results });
        });
    }
  };

  openFile = file => event => {
    event.stopPropagation();
    const fileName = joinPaths(this.props.path, file);
    return fs.readFile(fileName, { encoding: 'utf-8' }).then(text => {
      this.props.dispatch(createView(fileName, text));
    });
  };

  render () {
    const right = cx('triangle', 'right');
    const down = cx('triangle', 'down');
    return (
      <div className={css.root}>
        {this.state.directories.map(directory => (
          <div key={directory}>
            <span
              className={css.directory}
              onClick={this.toggleDirectory(directory)}
            >
              <span className={this.state[directory] ? down : right} />
              {`${ directory }/`}
            </span>
            {this.state[directory] && (
              <RecursiveInnerTree
                path={joinPaths(this.props.path, directory)}
                dispatch={this.props.dispatch}
              />
            )}
          </div>
        ))}
        {this.state.files.map(file => (
          <div key={file}>
            <span className={css.file} onClick={this.openFile(file)}>
              {file}
            </span>
          </div>
        ))}
      </div>
    );
  }
}

export default RecursiveInnerTree;
