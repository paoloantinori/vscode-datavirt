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
export class DataVirtConfig {
	api_version: string;
	kind: string;
	metadata: MetaData;
	spec: Spec;
}

export class MetaData {
	name: string;
}

export class Spec {
	replicas: number;
	env: Property[];
	datasources: DataSourceConfig[];
	build: Build;
}

export class DataSourceConfig {
	name: string;
	type: string;
	properties: Property[] = new Array();

	constructor(name: string, type: string) {
		this.name = name;
		this.type = type;
	}
}

export class ValueFrom {
	valueFrom: SecretRef | ConfigMapRef;

	constructor(ref: SecretRef | ConfigMapRef) {
		this.valueFrom = ref;
	}
}

export class SecretRef {
	secretKeyRef: KeyRef;

	constructor(keyRef: KeyRef) {
		this.secretKeyRef = keyRef;
	}
}

export class ConfigMapRef {
	configMapKeyRef: KeyRef;

	constructor(keyRef: KeyRef) {
		this.configMapKeyRef = keyRef;
	}
}

export class KeyRef {
	name: string;
	key: string;

	constructor(name: string, key: string) {
		this.name = name;
		this.key = key;
	}
}

export class Property {
	name: string;
	value?: string;
	valueFrom?: ValueFrom;

	constructor(name: string, value?: string, valueFrom?: ValueFrom) {
		this.name = name;
		if (value) this.value = value;
		if (valueFrom) this.valueFrom = valueFrom;
	}
}

export class Build {
	source: Source;
}

export class Source {
	ddl: string;
}
