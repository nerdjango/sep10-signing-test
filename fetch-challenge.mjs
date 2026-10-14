import { WebAuth } from "@stellar/stellar-sdk";

const walletPublicKey =
    "GAPZT6FP42ENFLDCQJRBICMTYXYTIRJ7PMYCXYM7FRUJGQ4IMS6M6GFZ";
const anchorAuthUrl = "https://testanchor.stellar.org/auth";
const serverAccountId =
    "GCHLHDBOKG2JWMJQBTLSL5XG6NO7ESXI2TAQKZXCXWXB5WI2X6W233PR"; // from https://testanchor.stellar.org/.well-known/stellar.toml SIGNING_KEY

const url = new URL(anchorAuthUrl);
url.searchParams.set("account", walletPublicKey);

try {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Anchor returned HTTP ${response.status}: ${await response.text()}`
        );
    }

    const data = await response.json();

    if (!data.transaction || !data.network_passphrase) {
        throw new Error(
            "Response must contain transaction and network_passphrase."
        );
    }

    console.log("Challenge XDR:", data.transaction);
    console.log("Network Passphrase:", data.network_passphrase);

    const validated = WebAuth.readChallengeTx(
        data.transaction,
        serverAccountId,
        data.network_passphrase,
        "testanchor.stellar.org",
        "testanchor.stellar.org"
    );

    if (validated.clientAccountID !== walletPublicKey) {
        throw new Error("Challenge is for a different wallet.");
    }

    console.log("Challenge validated successfully.");
    console.log("Client account:", validated.clientAccountID);
    console.log("Server account:", validated.tx._source);
} catch (error) {
    console.error("Failed to fetch challenge:", error.message);
    process.exitCode = 1;
}
