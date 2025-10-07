document.addEventListener("DOMContentLoaded", function () {
    for (const elt of document.querySelectorAll("#values-yml-inputs > input"))
        elt.addEventListener("input", updateAllOutputs);

    const privateKey = document.getElementById("private-key").value;
    const publicKey = document.getElementById("public-key").value;

    if (!privateKey || !publicKey) randomizeKeyPair();
    syncUsersTable();
});

function getUsersDb() {
    if (!localStorage.getItem("users")) return [];
    return JSON.parse(localStorage.users);
}

function setUsersDb(users) {
    localStorage.users = JSON.stringify(users);
    syncUsersTable();
}

function usersTable() {
    return document.querySelector("#users > tbody");
}

function generateUuid() {
    return window.crypto.randomUUID();
}

function makeUuidCell(id) {
    const cell = document.createElement("td");
    cell.textContent = id;
    return cell;
}

function makeDeleteCell(id) {
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        const users = getUsersDb();
        users.splice(users.indexOf(id), 1);
        setUsersDb(users);
    });
    button.textContent = "🗑️";

    const cell = document.createElement("td");
    cell.append(button);
    return cell;
}

function syncUsersTable() {
    usersTable().innerHTML = "";
    for (const id of getUsersDb()) {
        const row = document.createElement("tr");
        row.append(
            makeDeleteCell(id),
            makeUuidCell(id),
            document.createElement("td")
        );
        usersTable().appendChild(row);
    }
    updateAllOutputs();
}

function addUser() {
    let users = getUsersDb();
    users = users.concat([generateUuid()]);
    setUsersDb(users);
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

    updateAllOutputs();
}

function getVlessUrl(id) {
    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;
    const publicKey = document.getElementById("public-key").value;
    const realityTarget = document.getElementById("reality-target").value;

    let params = "encryption=none&type=tcp&alpn=http%2F1.1&fp=chrome";
    params = `${params}&headerType=none&sni=${realityTarget}&host=${realityTarget}`;
    params = `${params}&flow=xtls-rprx-vision&security=reality&pbk=${publicKey}`;
    const shebang = `${host}:${port}/?${params}`;
    return `vless://${id}@${shebang}`;
}

function updateCustomVlessUrl() {
    const link = getVlessUrl(document.getElementById("custom-id").value);
    document.getElementById("custom-vless-url").value = link;
}

function copyCustomVlessUrl() {
    const link = getVlessUrl(document.getElementById("custom-id").value);
    navigator.clipboard.writeText(link);
}

function updateValuesYml() {
    const port = document.getElementById("port").value;
    const privateKey = document.getElementById("private-key").value;
    const realityTarget = document.getElementById("reality-target").value;

    let yml = "logLevel: info\n";
    yml += `port: ${port}\n`;
    yml += `realityTarget: ${realityTarget}:443\n`;
    yml += `realityServerName: ${realityTarget}\n`;
    yml += `privateKey: ${privateKey}\n`;
    yml += "users:" + (usersTable().children.length ? "\n" : " []");

    for (const row of usersTable().children) {
        const id = row.children[1].textContent;
        yml += `  - id: ${id}\n`;

        const anchor = document.createElement("a");
        anchor.target = "_blank";
        anchor.href = getVlessUrl(id);
        anchor.textContent = "VLESS URL";

        const copy = document.createElement("button");
        copy.addEventListener("click", () => {
            navigator.clipboard.writeText(anchor.href);
        });
        copy.textContent = "📋";

        const linky = row.children[2];
        linky.innerHTML = "";
        linky.append(anchor, " ", copy);
    }

    document.getElementById("values-yml-output").value = yml;
}

function updateAllOutputs() {
    updateCustomVlessUrl();
    updateValuesYml();
}
