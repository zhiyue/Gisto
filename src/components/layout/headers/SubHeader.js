import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import styled from 'styled-components';

import { boxShadow } from 'constants/colors';

import Search from 'components/Search';
import SnippetHeader from 'components/layout/headers/SnippetHeader';

const SubHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  vertical-align: middle;
  height: 60px;
  box-shadow: 0 1px 2px ${boxShadow};
  z-index: 1;
`;

const SnippetHeaderBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex: 1;
  align-items: center;
  margin: 0 0 0 10px;
`;

const SubHeader = () => (
  <SubHeaderWrapper>
    <Search/>
    <SnippetHeaderBlock>
      <Router>
        <Switch>
          <Route exact path="/" component={ () => <div>Dashboard</div> }/>
          <Route exact path="/about" component={ () => <div>About</div> }/>
          <Route exact path="/settings" component={ () => <div>Settings</div> }/>
          <Route path="/snippet/:id" component={ SnippetHeader }/>
        </Switch>
      </Router>
    </SnippetHeaderBlock>
  </SubHeaderWrapper>
);

export default SubHeader;