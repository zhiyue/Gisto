import React from 'react';
import PropType from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
  set, findIndex, map, filter, isEmpty, get, keys
} from 'lodash/fp';
import uuid from 'uuid';
import { HashRouter as Router, Link } from 'react-router-dom';

import * as snippetActions from 'actions/snippets';

import { DEFAULT_SNIPPET_DESCRIPTION } from 'constants/config';
import { syntaxMap } from 'constants/editor';

import { prepareFiles } from 'utils/snippets';
import { gaPage } from 'utils/ga';
import { getSetting } from 'utils/settings';
import { randomString } from 'utils/string';

import Input from 'components/common/controls/Input';
import Editor from 'components/common/controls/Editor';
import Icon from 'components/common/Icon';
import ExternalLink from 'components/common/ExternalLink';
import Button from 'components/common/controls/Button';
import Checkbox from 'components/common/controls/Checkbox';
import DropZone from 'components/common/DropZone';
import Select from 'components/common/controls/Select';

const StyledInput = styled(Input)`
  margin: 0;
  text-indent: 10px;
  width: 100%;
  z-index: 1;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 0 10px 0 0;
`;

const Section = styled.div`
  margin: 20px 0;
`;

const FileSection = styled(Section)`
  border: 1px solid ${(props) => props.theme.baseAppColor};
  padding: 20px;
  border-radius: 3px;
  
  > div {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 0 0 -20px 0;
  }
  
  &:last-of-type {
    margin-bottom: 70px;
  }
`;

const StyledButton = styled(Button)`
  margin: 0 10px 0 0;
`;

const StyledDeleteButton = styled(StyledButton)`
  line-height: 21px;
  margin: 0 0 0 20px;
  width: auto;
  white-space: nowrap;
  color: ${(props) => props.theme.colorDanger};
  border-color: ${(props) => props.theme.colorDanger};
  
  span {
    background-color: ${(props) => props.theme.colorDanger};
  }
`;

const H1 = styled.h1`
  font-weight: 300;
  font-size: 22px;
`;

const ButtonsSection = styled.section`
  position: fixed;
  bottom: 0;
  padding: 20px;
  margin: 0 0 0 -25px;
  background: ${(props) => props.theme.bg};
  box-shadow: 0 -1px 2px ${(props) => props.theme.boxShadow};
  display: flex;
  justify-content: space-between;
  width: calc(100vw - 25px);
  z-index: 1;
`;

const StyledLink = styled(Link)`
  color: ${(props) => props.theme.baseAppColor};
  text-decoration: none;
  line-height: 25px;
`;

const StyledSelect = styled(Select)`
  margin-left: 20px;
  height: 33px;
`;

export class NewSnippet extends React.Component {
  state = {
    public: getSetting('defaultNewIsPublic', false),
    description: '',
    files: []
  };

  componentDidMount() {
    gaPage('Add new');
  }

  setDescription = (description) => {
    this.setState({ description });
  };


  setFileData = (value, id, type) => {
    const { files } = this.state;
    const indexofFile = findIndex({ uuid: id }, files);
    const newFiles = set([indexofFile, type], value, files);

    this.setState({ files: newFiles });
  };

  togglePublic = () => {
    this.setState((prevState) => ({
      public: !prevState.public
    }));
  };

  addFile = (name, content = '') => {
    const fileStructure = {
      uuid: uuid.v4(),
      name: name || randomString(5),
      language: getSetting('setings-default-new-snippet-language', 'Text'),
      content
    };

    this.setState((prevState) => ({
      files: [...prevState.files, fileStructure]
    }));
  };

  deleteFile = (id) => {
    const { files } = this.state;
    const updatedFiles = filter((file) => file.uuid !== id, files);

    this.setState({ files: updatedFiles });
  };

  save = () => {
    this.props.createSnippet({
      description: this.state.description,
      isPublic: this.state.public,
      files: prepareFiles(this.state.files)
    });
  };

  render() {
    const { theme } = this.props;

    return (
      <div>

        <DropZone onAddFile={ this.addFile }/>

        <H1><strong>New { this.state.public ? 'public' : 'private' } snippet:</strong> { this.state.description }</H1>

        <Section>
          <StyledInput type="text"
                       onChange={ (event) => this.setDescription(event.target.value) }
                       placeholder={ `Description (default ${DEFAULT_SNIPPET_DESCRIPTION})` }/>
        </Section>

        <Section>
          <StyledCheckbox checked={ this.state.public }
                          value={ getSetting('defaultNewIsPublic', false) }
                          onChange={ () => this.togglePublic() }/>
          &nbsp;
          <span>
          Public snippet
            &nbsp;
            <ExternalLink href="https://help.github.com/articles/about-gists/#types-of-gists">
              <Icon type="info" size="16" color={ theme.baseAppColor }/>
            </ExternalLink>
          </span>
        </Section>

        { map((file) => (
          <FileSection key={ file.uuid }>
            <div>
              <StyledInput type="text"
                           value={ file.name }
                           onChange={ (event) => this.setFileData(event.target.value, file.uuid, 'name') }
                           placeholder="file.ext"/>
              <StyledSelect value={ getSetting('setings-default-new-snippet-language', 'Text') }
                            onChange={ (event) => this.setFileData(event.target.value, file.uuid, 'language') }>
                { map((language) => (
                  <option value={ language } key={ language }>{ language }</option>
                ), keys(syntaxMap)) }
              </StyledSelect>
              <StyledDeleteButton icon="delete"
                                  invert
                                  onClick={ () => this.deleteFile(file.uuid) }>
                <strong>Remove</strong> { file.name || 'this file' }
              </StyledDeleteButton>
            </div>
            <br/>
            <br/>

            <Editor file={ file }
                    isNew
                    id={ file.uuid }
                    onChange={ (value) => this.setFileData(value, file.uuid, 'content') }/>

          </FileSection>
        ), this.state.files) }

        <ButtonsSection>

          <Router>
            <StyledButton icon="arrow-left" invert>
              <StyledLink to="/">Back to list</StyledLink>
            </StyledButton>
          </Router>

          <StyledButton invert
                        icon="add"
                        onClick={ () => this.addFile() }>
            Add file
          </StyledButton>

          <StyledButton icon="success"
                        onClick={ () => this.save() }
                        disabled={ isEmpty(this.state.files) }>
            Save
          </StyledButton>

        </ButtonsSection>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  theme: get(['ui', 'settings', 'theme'], state)
});

NewSnippet.propTypes = {
  createSnippet: PropType.func,
  theme: PropType.object
};

export default connect(mapStateToProps, {
  createSnippet: snippetActions.createSnippet
})(NewSnippet);
