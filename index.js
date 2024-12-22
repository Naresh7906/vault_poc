const express = require('express');
const { DefaultAzureCredential  } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');
require('dotenv').config();
const app = express();
app.use(express.json());

// Initialize Azure Key Vault client
// const credential = new DefaultAzureCredential();
const credential = new DefaultAzureCredential()

const vaultName = process.env.VAULT_NAME;
const vaultUrl = `https://${vaultName}.vault.azure.net`;
const secretClient = new SecretClient(vaultUrl, credential);

// Create/Update a secret
app.post('/secrets/:name', async (req, res) => {
    try {
        const { value } = req.body;
        const result = await secretClient.setSecret(req.params.name, value);
        res.json({ message: 'Secret created/updated successfully', name: result.name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a secret
app.get('/secrets/:name', async (req, res) => {
    try {
        const result = await secretClient.getSecret(req.params.name);
        res.json({ name: result.name, value: result.value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// List all secrets
app.get('/secrets', async (req, res) => {
    try {
        const secrets = [];
        for await (const secret of secretClient.listPropertiesOfSecrets()) {
            secrets.push(secret.name);
        }
        res.json({ secrets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a secret
app.delete('/secrets/:name', async (req, res) => {
    try {
        await secretClient.beginDeleteSecret(req.params.name);
        res.json({ message: 'Secret deletion initiated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
