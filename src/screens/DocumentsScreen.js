import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import queryString from 'query-string';

import { fetchDocuments } from '../store/actions';

import DocumentsContainer from '../containers/DocumentsContainer';
import Search from '../components/Search';

const SearchWithRouter = withRouter(Search);

class DocumentsScreen extends Component {
  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // should account for multiple filters in the future
    if (this.props.query.q !== prevProps.query.q) {
      this.fetchData();
    }
  }

  fetchData() {
    const { query, fetchDocuments } = this.props;
    fetchDocuments(query);
  }

  render() {
    return (
      <div>
        <SearchWithRouter />
        <DocumentsContainer />
      </div>
    )
  }
}

const mapStateToProps = (state, { location }) => {
  const params = queryString.parse(location.search);

  return {
    query: params
  };
}

DocumentsScreen = connect(
  mapStateToProps,
  { fetchDocuments }
)(DocumentsScreen);

export default DocumentsScreen;
