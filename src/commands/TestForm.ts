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
import { ViewColumn, Uri, WebviewPanel, window } from 'vscode';

let panel: WebviewPanel;
// for tests only
let callback: (message: string) => void;

export async function testForm() {
	if (extension.workspaceReady) {
		var message = await showForm("Paolo waz here", [] );
		//message = message.then(value => {return value;});
		console.log({message});
		if (message === "") {
			const allowEmpty = await window.showWarningMessage(
				"Do you really want to commit an empty message?",
				{ modal: true },
				"Yes"
				);
				
			}
			return message;
			
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
	
	async function showForm(message?: string, filePaths?: string[]) {
		
		const promise = new Promise<string>(resolve => {
			
			// Close previous commit message input
			if (panel) {
				panel.dispose();
			}
			
			// for tests only
			callback = (m: string) => {
				resolve(m);
				panel.dispose();
			};
			
			panel = window.createWebviewPanel("newForm", "Create Stuff", {
				preserveFocus: false,
				viewColumn: ViewColumn.Active
			},
			{
				enableScripts: true,
				retainContextWhenHidden: true
			});
			
			const styleUri = Uri.file(
				path.join(__dirname, "..", "..", "css", "stylesheet.css")
				).with({ scheme: "vscode-resource" });
				
				const html = `<!DOCTYPE html>
				<html lang="en">
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Create stuff</title>
				<link rel="stylesheet" href="${styleUri}">
				</head>
				<body>
				<section class="container">
				<form>
				<fieldset>
				<label for="key">Key here</label>
				<input id="key" placeholder="aaa"></input>
				<label for="value">Value here</label>
				<input id="value" placeholder="bbb"></input>
				<label for="message">text area example</label>
				<textarea id="message" rows="5" placeholder="ccc"></textarea>
				<button id="submit" class="button-primary">Create</button>
				<div class="float-right">
				<button id="cancel" class="button button-outline">Cancel</button>
				</div>
				</fieldset>
				</form>
				</section>
				<script>
				const vscode = acquireVsCodeApi();
				const txtMessage = document.getElementById("message");
				const key = document.getElementById("key");
				const value = document.getElementById("value");
				const btnSubmit = document.getElementById("submit");
				const btnCancel = document.getElementById("cancel");
				// load current message
				txtMessage.value = ${JSON.stringify(message)};
				
				btnSubmit.addEventListener("click", function() {
					vscode.postMessage({
						command: "commit",
						key: key.value,
						value: value.value,
						message: txtMessage.value
					});
				});
				btnCancel.addEventListener("click", function() {
					vscode.postMessage({
						command: "cancel"
					});
				});
				// Allow CTRL + Enter
				txtMessage.addEventListener("keydown", function(e) {
					if (event.ctrlKey && event.keyCode === 13) {
						btnCommit.click();
					}
				});
				window.addEventListener("load", function() {
					setTimeout(() => {
						txtMessage.focus();
					}, 1000);
				});
				</script>
				</body>
				</html>`;
				
				panel.webview.html = html;
				
				// On close
				panel.onDidDispose(() => {
					resolve(undefined);
				});
				
				// On button click
				panel.webview.onDidReceiveMessage(message => {
					switch (message.command) {
						case "commit":
						console.log("button pressed");
						resolve(message);
						panel.dispose();
						break;
						default:
						resolve(undefined);
						panel.dispose();
					}
				});
				
				// Force show and activate
				panel.reveal(ViewColumn.Active, false);
			});
			
			return await promise;
		}
		