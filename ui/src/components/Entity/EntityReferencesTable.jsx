import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Waypoint from 'react-waypoint';
import _ from 'lodash';

import Query from 'src/app/Query';
import Fragment from 'src/app/Fragment';
import { queryEntities } from 'src/actions/index';
import { selectEntitiesResult } from 'src/selectors';
import { SectionLoading, Property } from 'src/components/common';
import ensureArray from 'src/util/ensureArray';

import './EntityReferencesTable.css';

class EntityReferencesTable extends Component {
  constructor(props) {
    super(props);
    this.fetchData = this.fetchData.bind(this);
    this.getMoreResults = this.getMoreResults.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (!this.props.query.sameAs(prevProps.query)) {
      this.fetchData();
    }
  }

  fetchData() {
    const { query, result } = this.props;
    if (result.total === undefined) {
      this.props.queryEntities({ query });
    }
  }

  getMoreResults() {
    const { query, result, queryEntities } = this.props;
    if (result && !result.isLoading && result.next) {
      queryEntities({ query, next: result.next });
    }
  }

  onShowDetails(entity) {
    const { history } = this.props;
    return (event) => {
      event.preventDefault();
      const fragment = new Fragment(history);
      if(fragment.state['preview:id']) {
        fragment.update({'preview:id': null});
      } else {
        fragment.update({
          'preview:type': 'entity',
          'preview:id': entity.id
        });
      }
    }
  }

  render() {
    const { model, result, property } = this.props;
    const results = ensureArray(result.results);
    const columns = _.map(model.featured, (name) => {
      return model.properties[name];
    }).filter((prop) => {
      return prop.name !== property.name || !prop.caption;
    });

    // count how often a prop is present and show only those with values:
    // const counts = {};
    // for (let res of results) {
    //   _.keys(res.properties).forEach((key) => {
    //     counts[key] = counts[key] ? counts[key] + 1 : 1;
    //   });
    // }
    // const columns = _.values(model.properties).filter((prop) => {
    //   if (prop.name === property.name || prop.caption) {
    //     return false;
    //   }
    //   return (
    //     (Array.isArray(model.featured) && model.featured.includes(prop.name))
    //   );
    // });
    // columns.sort((a, b) =>  {
    //   return (counts[b.name] || 0) - (counts[a.name] || 0);
    // });

    return (
      <section className="EntityReferencesTable">
        <table className="data-table references-data-table">
          <thead>
            <tr>
              {columns.map(prop => (
                <th key={prop.name} className={prop.type}>
                  <Property.Name model={prop} />
                </th>
              ))}
              <th key="details" className="narrow"/>
            </tr>
          </thead>
          <tbody>
            {results.map((entity) => (
              <tr key={entity.id}>
                {columns.map(prop => (
                  <td key={prop.name} className={prop.type}>
                    <Property.Values model={prop} values={entity.properties[prop.name]} />
                  </td>
                ))}
                <td key="details" className="narrow">
                  <a onClick={this.onShowDetails(entity)}>
                    <span>Details</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        { !result.isLoading && result.next && (
          <Waypoint
            onEnter={this.getMoreResults}
            bottomOffset="-600px"
            scrollableAncestor={window}
          />
        )}
        { result.isLoading && (
          <SectionLoading />
        )}
      </section>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { entity, property } = ownProps;
  const context = {
    [`filter:properties.${property.name}`]: entity.id
  };
  const query = Query.fromLocation('search', {}, context, property.name);

  return {
    query: query,
    result: selectEntitiesResult(state, query),
    model: state.metadata.schemata[ownProps.schema]
  }
};

EntityReferencesTable = connect(mapStateToProps, { queryEntities })(EntityReferencesTable);
EntityReferencesTable = withRouter(EntityReferencesTable);
export default EntityReferencesTable;