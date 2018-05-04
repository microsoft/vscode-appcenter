/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

/**
 * Event Setting
 *
 */
class EventSetting {
  /**
   * Create a EventSetting.
   * @member {string} value Frequency of event. Possible values include:
   * 'Disabled', 'Individual', 'Daily', 'DailyAndIndividual', 'Default'
   * @member {string} [defaultValue] Default frequency of event. Possible
   * values include: 'Disabled', 'Individual', 'Daily', 'DailyAndIndividual'
   */
  constructor() {
  }

  /**
   * Defines the metadata of EventSetting
   *
   * @returns {object} metadata of EventSetting
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'EventSetting',
      type: {
        name: 'Composite',
        className: 'EventSetting',
        modelProperties: {
          eventType: {
            required: true,
            isConstant: true,
            serializedName: 'event_type',
            defaultValue: 'crash_newCrashGroupCreated',
            type: {
              name: 'String'
            }
          },
          value: {
            required: true,
            serializedName: 'value',
            type: {
              name: 'String'
            }
          },
          defaultValue: {
            required: false,
            serializedName: 'default_value',
            type: {
              name: 'String'
            }
          }
        }
      }
    };
  }
}

module.exports = EventSetting;