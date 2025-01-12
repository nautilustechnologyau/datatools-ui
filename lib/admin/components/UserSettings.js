// @flow

import React, { Component, type Node } from 'react'
import {
  Checkbox,
  Col,
  Label as BsLabel,
  MenuItem,
  Panel,
  Row,
  SplitButton
} from 'react-bootstrap'
import update from 'react-addons-update'
import Select from 'react-select'

import UserPermissions from '../../common/user/UserPermissions'
import { getComponentMessages } from '../../common/util/config'
import * as feedActions from '../../manager/actions/feeds'
import type { Permission, PermissionType } from '../../common/user/UserPermissions'
import type { Organization, Project } from '../../types'
import type { ManagerUserState } from '../../types/reducers'

import AccountTypeSelector from './AccountTypeSelector'
import ProjectAccessSettings from './ProjectAccessSettings'

type Props = {
  accountType?: ?string,
  creatingUser: ManagerUserState,
  fetchProjectFeeds: typeof feedActions.fetchProjectFeeds,
  isCreating?: boolean,
  organizations: Array<Organization>,
  permissions: UserPermissions,
  projects: Array<Project>,
  userEmailDataSlug?: string
}

type State = {
  accountType: ?string,
  appAdminChecked: boolean,
  currentProjectIndex: number,
  orgAdminChecked?: boolean,
  organization: ?Organization,
  projectSettings: {
    [string]: {
      access: string,
      defaultFeeds: Array<string>,
      permissions: Array<string>
    }
  }
}

type OrganizationOption = {
  label: string,
  organization: Organization,
  value: string
}

const orgToOption = (organization: Organization) => {
  return { label: organization.name, value: organization.id, organization }
}

export default class UserSettings extends Component<Props, State> {
  messages = getComponentMessages('UserSettings')

  constructor (props: Props) {
    super(props)
    const {
      accountType,
      creatingUser,
      isCreating,
      organizations,
      permissions,
      projects
    } = this.props
    this.state = {
      accountType,
      appAdminChecked: permissions.isApplicationAdmin(),
      currentProjectIndex: 0,
      projectSettings: {},
      organization: null
    }

    organizations.forEach((organization: Organization) => {
      if (permissions.hasOrganization(organization.id)) {
        this.state.organization = organization
        if (permissions.isOrganizationAdmin(organization.id)) {
          this.state.orgAdminChecked = true
        }
      } else if (
        isCreating &&
        creatingUser.permissions &&
        creatingUser.permissions.getOrganizationId() === organization.id
      ) {
        this.state.organization = organization
      }
    })
    projects.forEach((project: Project) => {
      this.state.projectSettings[project.id] = this._initProjectSettings(project, permissions)
    })
  }

  /**
   * Initialize project settings state from project and user permissions object.
   */
  _initProjectSettings = (project: Project, permissions: UserPermissions) => {
    let access: string = 'none'
    let defaultFeeds: Array<string> = []
    let newPermissions: Array<string> = []
    if (permissions.hasProject(project.id, project.organizationId)) {
      if (permissions.isProjectAdmin(project.id, project.organizationId)) {
        access = 'admin'
      } else {
        access = 'custom'
        const projectPermissions: Array<Permission> = permissions.getProjectPermissions(project.id)
        newPermissions = projectPermissions.map((p: Permission) => p.type)
        defaultFeeds = permissions.getProjectDefaultFeeds(project.id)
      }
    }
    return { access, defaultFeeds, permissions: newPermissions }
  }

  getSettings () {
    const {
      accountType,
      appAdminChecked,
      orgAdminChecked,
      organization,
      projectSettings
    } = this.state
    if (appAdminChecked) {
      return {
        client_id: process.env.AUTH0_CLIENT_ID,
        permissions: [{
          type: 'administer-application'
        }],
        projects: []
      }
    }

    const settings = {
      account_type: accountType,
      client_id: process.env.AUTH0_CLIENT_ID,
      organizations: [],
      permissions: [],
      projects: []
    }
    if (organization) {
      const orgSettings = {
        organization_id: organization.id,
        permissions: orgAdminChecked
          ? [{type: 'administer-organization'}]
          : []
      }
      settings.organizations.push(orgSettings)
    }
    this.props.projects.forEach((project: Project, i: number) => {
      const stateProjectSettings = projectSettings[project.id]
      if (stateProjectSettings.access === 'none') return

      const newProjectSettings = {}
      newProjectSettings.project_id = project.id
      let permissions: Array<{feeds?: Array<string>, type: string}> = []
      if (stateProjectSettings.access === 'admin') {
        permissions.push({
          type: 'administer-project'
        })
      } else if (stateProjectSettings.access === 'custom') {
        newProjectSettings.defaultFeeds = stateProjectSettings.defaultFeeds
        // users have view-all permissions by default
        permissions.push({
          type: 'view-feed',
          feeds: ['*']
        })
        permissions = permissions
          .concat(stateProjectSettings.permissions.map((permission) => ({type: permission})))
      }
      newProjectSettings.permissions = permissions
      settings.projects.push(newProjectSettings)
    })

    return settings
  }

  _onProjectSelected = (key: number) => this.setState({currentProjectIndex: key})

  getProjectLabel = (access: string): Node => {
    switch (access) {
      case 'none': return <BsLabel>{this.messages('project.noAccess')}</BsLabel>
      case 'admin': return <BsLabel bsStyle='primary'>{this.messages('project.admin')}</BsLabel>
      case 'custom': return <BsLabel bsStyle='success'>{this.messages('project.custom')}</BsLabel>
      default: return null
    }
  }

  appAdminClicked = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    const appAdminChecked: boolean = evt.target.checked
    const stateUpdate = {}
    stateUpdate.appAdminChecked = appAdminChecked
    if (appAdminChecked) {
      stateUpdate.organization = null
      stateUpdate.orgAdminChecked = false
    }
    this.setState(stateUpdate)
  }

  _onAccountTypeChanged = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    // Leave account type null if the default one is selected.
    const accountType = evt.target.value
    this.setState({ accountType: accountType === 'default' ? null : accountType })
  }

  _onOrgAdminClicked = (evt: SyntheticInputEvent<HTMLInputElement>) => {
    this.setState({ orgAdminChecked: evt.target.checked })
  }

  _onOrgChanged = (val: OrganizationOption) => {
    const stateUpdate = {
      organization: (val && val.organization) || null,
      orgAdminChecked: false,
      projectSettings: {}
    }
    this.props.projects.forEach((p: Project) => {
      const access: string = 'none'
      const defaultFeeds = []
      const permissions = []
      stateUpdate.projectSettings[p.id] = {access, defaultFeeds, permissions}
    })
    this.setState(stateUpdate)
  }

  projectAccessUpdated = (projectId: string, newAccess: string) => {
    const stateUpdate = {projectSettings: {[projectId]: {$merge: {access: newAccess}}}}
    this.setState(update(this.state, stateUpdate))
  }

  /**
   * Handler to add or remove a feed for a user to a project's default feeds
   * list (for which the project's permissions apply to).
   */
  projectFeedsUpdated = (projectId: string, feedId: string, include: boolean) => {
    const index = this.state.projectSettings[projectId].defaultFeeds.indexOf(feedId)
    let stateUpdate = {}
    if (index === -1 && include) {
      // Add to state if feed not found and should be included.
      stateUpdate = {projectSettings: {[projectId]: {defaultFeeds: {$push: [feedId]}}}}
    } else if (index !== -1) {
      // Remove from state if feed found && should not be included
      stateUpdate = {projectSettings: {[projectId]: {defaultFeeds: {$splice: [[index, 1]]}}}}
    } else {
      console.warn(`Unknown error occurred while ${include ? 'adding' : 'removing'} feed! Setting default feeds to empty list.`, this.state, feedId)
      stateUpdate = {projectSettings: {[projectId]: {defaultFeeds: {$set: []}}}}
    }
    this.setState(update(this.state, stateUpdate))
  }

  /**
   * Handler to add or remove a project permission for a user.
   */
  projectPermissionsUpdated = (projectId: string, type: PermissionType, include: boolean) => {
    const index = this.state.projectSettings[projectId].permissions.indexOf(type)
    let stateUpdate = {}
    if (index === -1 && include) {
      // Add to state if permission not found and should be included.
      stateUpdate = {projectSettings: {[projectId]: {permissions: {$push: [type]}}}}
    } else if (index !== -1) {
      // Remove from state if permission found && should not be included
      stateUpdate = {projectSettings: {[projectId]: {permissions: {$splice: [[index, 1]]}}}}
    } else {
      console.warn(`Unknown error occurred while ${include ? 'adding' : 'removing'} permission! Setting permissions to empty list.`, this.state, type)
      stateUpdate = {projectSettings: {[projectId]: {permissions: {$set: []}}}}
    }
    this.setState(update(this.state, stateUpdate))
  }

  render () {
    const {
      creatingUser,
      fetchProjectFeeds,
      organizations,
      projects,
      userEmailDataSlug
    } = this.props
    const creatorIsApplicationAdmin = !!(creatingUser.permissions &&
      creatingUser.permissions.isApplicationAdmin())

    // limit available projects to those that either have no org or match the current state org
    const orgProjects = projects
      .filter(p => !p.organizationId || (this.state.organization && this.state.organization.id === p.organizationId))
    const currentProject: Project = orgProjects[this.state.currentProjectIndex]
    const displayedProjectTitle = currentProject ? currentProject.name : this.messages('noProjects')
    const projectPanel = (
      <Panel>
        <Panel.Heading>
          Project Settings for{' '}
          <SplitButton
            disabled={!currentProject}
            id={displayedProjectTitle}
            onSelect={this._onProjectSelected}
            title={displayedProjectTitle}
          >
            {orgProjects.map((project, i) => {
              const settings = this.state.projectSettings[project.id]
              return settings && (
                <MenuItem
                  eventKey={i}
                  key={project.id}
                >
                  {project.name} {this.getProjectLabel(settings.access)}
                </MenuItem>
              )
            })}
          </SplitButton>
        </Panel.Heading>

        <Panel.Body>
          {orgProjects.map((project: Project, i: number) => {
            if (i !== this.state.currentProjectIndex) return null
            const settings = this.state.projectSettings[project.id]
            return (
              <ProjectAccessSettings
                fetchProjectFeeds={fetchProjectFeeds}
                key={project.id}
                project={project}
                projectAccessUpdated={this.projectAccessUpdated}
                projectFeedsUpdated={this.projectFeedsUpdated}
                projectPermissionsUpdated={this.projectPermissionsUpdated}
                settings={settings}
                visible={i === this.state.currentProjectIndex}
              />
            )
          })}
        </Panel.Body>
      </Panel>
    )
    return (
      <Row>
        <Col xs={4}>
          <Panel>
            <Panel.Heading>Organization settings</Panel.Heading>
            <Panel.Body>
              {creatorIsApplicationAdmin &&
              <Checkbox
                checked={this.state.appAdminChecked}
                data-test-id={`app-admin-checkbox-${userEmailDataSlug || ''}`}
                onChange={this.appAdminClicked}
                ref='appAdminCheckbox'
              >
                {this.messages('admin.title')}
              </Checkbox>
              }
              {/* Display account type dropdown if user is not an admin (and more than one account types are configured). */}
              {!this.state.appAdminChecked && (
                <AccountTypeSelector
                  accountType={this.state.accountType}
                  id='formControlsAccountType'
                  onChanged={this._onAccountTypeChanged}
                />
              )}
              {/* Organizations selector. Only show if there exist organizations already. */}
              {!this.state.appAdminChecked && organizations && organizations.length
                ? <div className='orgDetails'>
                  <Select
                    options={organizations.map(orgToOption)}
                    placeholder='Choose organization...'
                    disabled={!creatorIsApplicationAdmin}
                    value={this.state.organization && orgToOption(this.state.organization)}
                    onChange={this._onOrgChanged}
                  />
                  {this.state.organization &&
                  <Checkbox
                    checked={this.state.orgAdminChecked}
                    onChange={this._onOrgAdminClicked}
                    ref='orgAdminCheckbox'
                  >
                    {this.messages('org.admin')}
                  </Checkbox>
                  }
                </div>
                : null
              }
            </Panel.Body>
          </Panel>
        </Col>
        <Col xs={8}>
          {this.state.appAdminChecked
            ? <i>{this.messages('admin.description')}</i>
            : this.state.orgAdminChecked
              ? <i>{this.messages('org.description')}</i>
              : projectPanel
          }
        </Col>
      </Row>
    )
  }
}
