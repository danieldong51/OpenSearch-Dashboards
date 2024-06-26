/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// @ts-ignore
import numeral from '@elastic/numeral';
// @ts-ignore
import numeralLanguages from '@elastic/numeral/languages';
import { OSD_FIELD_TYPES } from '../../osd_field_types/types';
import { FieldFormat } from '../field_format';
import { TextContextTypeConvert } from '../types';
import { UI_SETTINGS } from '../../constants';

const numeralInst = numeral();

numeralLanguages.forEach((numeralLanguage: Record<string, any>) => {
  numeral.language(numeralLanguage.id, numeralLanguage.lang);
});

export abstract class NumeralFormat extends FieldFormat {
  static fieldType = OSD_FIELD_TYPES.NUMBER;

  abstract id: string;
  abstract title: string;

  getParamDefaults = () => ({
    pattern: this.getConfig!(`format:${this.id}:defaultPattern`),
  });

  protected getConvertedValue(val: any): string {
    if (val === -Infinity) return '-∞';
    if (val === +Infinity) return '+∞';

    const isBigInt = typeof val === 'bigint';

    if (typeof val !== 'number' && !isBigInt) {
      val = parseFloat(val);
    }

    if (!isBigInt && isNaN(val)) return '';

    const previousLocale = numeral.language();
    const defaultLocale =
      (this.getConfig && this.getConfig(UI_SETTINGS.FORMAT_NUMBER_DEFAULT_LOCALE)) || 'en';
    numeral.language(defaultLocale);

    const formatted = numeralInst.set(val).format(this.param('pattern'));

    numeral.language(previousLocale);

    return formatted;
  }

  textConvert: TextContextTypeConvert = (val) => {
    return this.getConvertedValue(val);
  };
}
