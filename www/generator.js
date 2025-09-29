document.addEventListener("DOMContentLoaded", function () {
    for (const elt of document.querySelectorAll("#inputs > input"))
        elt.addEventListener("input", generateAll);

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

function makeDeleteCell(row, id) {
    const button = document.createElement("button");
    button.addEventListener("click", () => {
        const users = getUsersDb();
        users.splice(users.indexOf(id), 1);
        setUsersDb(users);
        syncUsersTable();
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
            makeDeleteCell(row, id),
            makeUuidCell(id),
            document.createElement("td")
        );
        usersTable().appendChild(row);
    }
    generateAll();
}

function addUser() {
    let users = getUsersDb();
    users = users.concat([generateUuid()]);
    setUsersDb(users);
    syncUsersTable();
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
    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;

    const privateKey = document.getElementById("private-key").value;
    const publicKey = document.getElementById("public-key").value;

    const realityTarget = document.getElementById("reality-target").value;
    const realityServerName = document.getElementById(
        "reality-server-name"
    ).value;

    let yml = "logLevel: info\n";
    yml += `port: ${port}\n`;
    yml += `realityTarget: ${realityTarget}\n`;
    yml += `realityServerName: ${realityServerName}\n`;
    yml += `privateKey: ${privateKey}\n`;
    yml += "users:\n";

    const realityHostname = new URL(realityTarget).hostname;
    const reality = `sni=${realityServerName}&type=tcp&alpn=http%2F1.1&host=${realityHostname}&encryption=none`;
    const params = `${reality}&flow=xtls-rprx-vision&security=reality&pbk=${publicKey}`;
    const shebang = `${host}:${port}/?${params}`;

    for (const row of usersTable().children) {
        const id = row.children[1].textContent;
        yml += `  - id: ${id}\n`;

        const anchor = document.createElement("a");
        anchor.href = `vless://${id}@${shebang}`;
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
