document.addEventListener("DOMContentLoaded", function () {
    randomizeKeyPair();
    for (const elt of document.querySelectorAll("#inputs > input"))
        elt.addEventListener("input", generateAll);
});

function usersTable() {
    return document.querySelector("#users > tbody");
}

function generateUuid() {
    return window.crypto.randomUUID();
}

function makeUuidCell(row) {
    const cell = document.createElement("td");
    cell.textContent = generateUuid();
    return cell;
}

function makeDeleteCell(row) {
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        usersTable().removeChild(row);
        generateAll();
    });
    button.textContent = "🗑️";

    const cell = document.createElement("td");
    cell.append(button);
    return cell;
}

function addUser() {
    const row = document.createElement("tr");
    row.append(
        makeDeleteCell(row),
        makeUuidCell(row),
        document.createElement("td")
    );
    usersTable().appendChild(row);
    generateAll();
}

function toBase64(bytes) {
    const str = Array.from(bytes, String.fromCodePoint).join("");
    return btoa(str).replaceAll("=", "");
}

async function randomizeKeyPair() {
    const { publicKey, privateKey } = await crypto.subtle.generateKey(
        "X25519",
        true,
        ["deriveKey", "deriveBits"]
    );

    document.getElementById("public-key").value = toBase64(
        new Uint8Array(await window.crypto.subtle.exportKey("raw", publicKey))
    );

    const derived = await window.crypto.subtle.deriveBits(
        { name: "X25519", public: publicKey },
        privateKey,
        128
    );
    document.getElementById("private-key").value = toBase64(
        new Uint8Array(derived)
    );

    generateAll();
}

function generateAll() {
    let yml = "logLevel: info\n";
    yml += `port: ${document.getElementById("port").value}\n`;
    yml += `realityTarget: ${
        document.getElementById("reality-target").value
    }\n`;
    yml += `realityServerName: ${
        document.getElementById("reality-server-name").value
    }\n`;
    yml += `privateKey: ${document.getElementById("private-key").value}\n`;
    yml += "users:\n";

    const shebang = "";
    for (const row of usersTable().children) {
        const id = row.children[1].textContent;
        yml += `  - id: ${id}\n`;

        const vless = `vless://${id}/${shebang}\n`;
        row.children[2].textContent = vless;
    }
    document.getElementById("values-yml-output").value = yml;
}
