/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

/**
 * A response containing information pertaining to starting a release upload
 * process
 *
 */
class ReleaseUploadBeginResponse {
  /**
   * Create a ReleaseUploadBeginResponse.
   * @member {string} uploadId The ID for the current upload
   * @member {string} uploadUrl The URL where the client needs to upload the
   * release to
   * @member {string} [assetId] In preview, the ID for the current upload
   * @member {string} [assetDomain] In preview, the URL for the current upload
   * @member {string} [assetToken] In preview, the token for the current upload
   */
  constructor() {
  }

  /**
   * Defines the metadata of ReleaseUploadBeginResponse
   *
   * @returns {object} metadata of ReleaseUploadBeginResponse
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'ReleaseUploadBeginResponse',
      type: {
        name: 'Composite',
        className: 'ReleaseUploadBeginResponse',
        modelProperties: {
          uploadId: {
            required: true,
            serializedName: 'upload_id',
            type: {
              name: 'String'
            }
          },
          uploadUrl: {
            required: true,
            serializedName: 'upload_url',
            type: {
              name: 'String'
            }
          },
          assetId: {
            required: false,
            serializedName: 'asset_id',
            type: {
              name: 'String'
            }
          },
          assetDomain: {
            required: false,
            serializedName: 'asset_domain',
            type: {
              name: 'String'
            }
          },
          assetToken: {
            required: false,
            serializedName: 'asset_token',
            type: {
              name: 'String'
            }
          }
        }
      }
    };
  }
}

module.exports = ReleaseUploadBeginResponse;
