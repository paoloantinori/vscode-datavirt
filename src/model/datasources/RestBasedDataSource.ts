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
import { IDataSourceConfig } from "../DataVirtModel";

export class RestBasedDataSource implements IDataSourceConfig {

	name: string;
	type: string;
	entries: Map<string, string> = new Map();
	
	constructor(name: string) {
		this.name = name;
		this.type = 'SPRING_TEIID_REST';
		this.initialize();
	}
	
	initialize() {
		this.entries.set(`${this.type}_${this.name}_ENDPOINT`, '');
		this.entries.set(`${this.type}_${this.name}_SECURITY_TYPE`, '');
		this.entries.set(`${this.type}_${this.name}_USER_NAME`, '');
		this.entries.set(`${this.type}_${this.name}_PASSWORD`, '');
	}
}