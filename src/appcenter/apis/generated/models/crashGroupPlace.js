/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

/**
 * Class representing a CrashGroupPlace.
 */
class CrashGroupPlace {
  /**
   * Create a CrashGroupPlace.
   * @member {string} [placeName] Place name
   * @member {number} [crashCount] count of places
   */
  constructor() {
  }

  /**
   * Defines the metadata of CrashGroupPlace
   *
   * @returns {object} metadata of CrashGroupPlace
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'CrashGroupPlace',
      type: {
        name: 'Composite',
        className: 'CrashGroupPlace',
        modelProperties: {
          placeName: {
            required: false,
            serializedName: 'place_name',
            type: {
              name: 'String'
            }
          },
          crashCount: {
            required: false,
            serializedName: 'crash_count',
            type: {
              name: 'Number'
            }
          }
        }
      }
    };
  }
}

module.exports = CrashGroupPlace;
