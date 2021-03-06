/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as constants from '../constants';
import * as extension from '../extension';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../utils';
import * as vscode from 'vscode';
import { DataVirtConfig } from '../model/DataVirtModel';
import { SchemaTreeNode } from '../model/tree/SchemaTreeNode';

export function createVDBCommand() {
	if (extension.workspaceReady) {
		vscode.window.showInputBox( { validateInput: (name: string) => {
			let res: string = utils.validateName(name);
			if (!res) {
				res = utils.validateFileNotExisting(name);
			}
			return res;
		}, placeHolder: 'Enter the name of the new VDB config' })
			.then( (vdbName: string) => {
				if (!vdbName) {
					return;
				}
				handleVDBCreation(vscode.workspace.workspaceFolders[0].uri.fsPath, vdbName)
					.then( (success: boolean) => {
						if (success) {
							openDDLEditor(vdbName);
							vscode.window.showInformationMessage(`New VDB ${vdbName} has been created successfully...`);
						} else {
							vscode.window.showErrorMessage(`An error occured when trying to create a new VDB with name ${vdbName}...`);
						}
					})
					.catch( (error) => {
						extension.log(error);
					});
			});
	} else {
		vscode.window.showErrorMessage(`DataVirt Tooling only works when a workspace folder is opened.` +
			` Please add a folder to the workspace with 'File->Add Folder to Workspace' or use the Command Palette (Ctrl+Shift+P) and type 'Add Folder'.` +
			` Once there is at least one folder in the workspace, please try again.`);
	}
}

export function handleVDBCreation(filepath: string, fileName: string, templateFolder?: string): Promise<boolean> {
	return new Promise<boolean>( (resolve, reject) => {
		if (fileName && fileName.length>0) {
			try {
				const templatePath = templateFolder ? path.join(templateFolder, 'vdb_template.yaml') : path.join(extension.pluginResourcesPath, 'vdb_template.yaml');
				const targetFile: string = path.join(filepath, `${fileName}.yaml`);
				fs.copyFileSync(templatePath, targetFile);
				const yamlDoc:DataVirtConfig = utils.loadModelFromFile(targetFile);
				yamlDoc.metadata.name = fileName;
				yamlDoc.spec.build.source.ddl = utils.replaceDDLNamePlaceholder(yamlDoc.spec.build.source.ddl, constants.DDL_NAME_PLACEHOLDER, fileName);
				utils.saveModelToFile(yamlDoc, targetFile);
				resolve(true);
			} catch (error) {
				reject(error);
			}
		} else {
			reject(new Error('handleVDBCreation: Unable to create the VDB because no name was given...'));
		}
	});
}

function openDDLEditor(vdbName: string) {
	const node: SchemaTreeNode = extension.dataVirtProvider.getSchemaTreeNodeOfProject(vdbName);
	if (node) {
		vscode.commands.executeCommand('datavirt.edit.schema', node);
	}
}
