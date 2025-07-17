// lib/azure-storage-utils.js
import {
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential
} from "@azure/storage-blob";

/**
 * Génère un URL SAS pour un blob dans Azure Storage
 * @param {string} accountName - Nom du compte de stockage Azure
 * @param {string} accountKey - Clé du compte de stockage Azure
 * @param {string} containerName - Nom du conteneur
 * @param {string} blobName - Nom du blob
 * @param {number} expiryMinutes - Durée de validité du SAS token en minutes
 * @returns {string} - URL SAS complet pour accéder au blob
 */
export function generateBlobSasUrl(
  accountName,
  accountKey,
  containerName,
  blobName,
  expiryMinutes = 60 
) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(expiresOn.getMinutes() + expiryMinutes);

  // Définir les permissions pour le blob
  const permissions = BlobSASPermissions.parse("racwd"); // Read, Add, Create, Write, Delete

  const sasOptions = {
    containerName,
    blobName,
    permissions,
    startsOn,
    expiresOn,
  };

  // Générer le token SAS
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  // Construire l'URL complet avec le token SAS
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

/**
 * Génère un URL SAS pour un conteneur dans Azure Storage
 * @param {string} accountName - Nom du compte de stockage Azure
 * @param {string} accountKey - Clé du compte de stockage Azure
 * @param {string} containerName - Nom du conteneur
 * @param {number} expiryMinutes - Durée de validité du SAS token en minutes
 * @returns {string} - URL SAS complet pour accéder au conteneur
 */
export function generateContainerSasUrl(
  accountName,
  accountKey,
  containerName,
  expiryMinutes = 60
) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(expiresOn.getMinutes() + expiryMinutes);

  // Définir les permissions pour le conteneur
  const permissions = BlobSASPermissions.parse("racwdl"); // Read, Add, Create, Write, Delete, List

  const sasOptions = {
    containerName,
    permissions,
    startsOn,
    expiresOn,
  };

  // Générer le token SAS
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential
  ).toString();

  // Construire l'URL complet avec le token SAS
  return `https://${accountName}.blob.core.windows.net/${containerName}?${sasToken}`;
}

/**
 * Extrait les informations du compte de stockage depuis la chaîne de connexion
 * @param {string} connectionString - Chaîne de connexion au compte de stockage Azure
 * @returns {Object} - Objet contenant le nom du compte et la clé
 */
export function parseStorageConnectionString(connectionString) {
  const accountName = connectionString.match(/AccountName=([^;]+)/i)?.[1];
  const accountKey = connectionString.match(/AccountKey=([^;]+)/i)?.[1];

  if (!accountName || !accountKey) {
    throw new Error('Format de chaîne de connexion invalide');
  }

  return { accountName, accountKey };
}