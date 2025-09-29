# no-bs

TODO: explain.

## Getting Started

> [!TIP]
> There is a [**`values.yml` generator**](https://no-bs.ru) available in case you can't be assed to read through all this.

To get started, you will need a K8S cluster managing at least one single VPS node. If you aren't sure what any of these words mean, you can quickly deploy such a cluster on the cheapest Linux VPS node you can find by running [the K3S installer](https://docs.k3s.io/quick-start), which is a K8S distribution I would personally recommend:

```sh
curl -sfL https://get.k3s.io | sh -
```

Once you have K3S or another K8S distribution running, you will need to write a [values file for Helm](https://helm.sh/docs/chart_template_guide/values_files). It needs to know in advance:

1. The private key for securing the connection from unwanted guests & leeches. Generate one alongside a pairing public key (you will need it later) by [downloading the latest XRay-core binary](https://github.com/XTLS/Xray-core/releases) and running it as `C:\Path\to\xray.exe x25519`.
2. The list of UUIDs each corresponding to a user of your tunnel. There is nothing wrong with using a single UUID e.g. for everyone in your family, but it makes more sense logistically to group these per-person or even per-person per-device in case you want to revoke somebody's access (read: ground them) without breaking all other connections.

   You can generate a UUID by running `C:\Path\to\xray.exe uuid`, or by using a shady website such as this one: <https://www.uuidgenerator.net/version4>.
3. You will also need to specify: a port to listen on (most commonly `443` to disguise traffic as TLS), a spoofed target site *that supports TLS1.3 and h2*[^tls], and a server name that matches one in the site's TLS certificate. If you aren't sure what we're talking about--I ain't neither! So feel free to use the defaults provided in this README.

All in all, your `values.yml` should look like [the provided example](values.example.yml):

```yml
logLevel: info
port: 443
realityTarget: https://presearch.com
realityServerName: presearch.com
privateKey: qDP05W-71C8VdIsVqmOsMa0CXBDFzG7e36hBZNDkAmY # xray x25519
users:
  - id: 44bd9494-1534-4d48-b2f7-4247343bbc92 # xray uuid
```

Now you can deploy the chart with [Helm](https://helm.sh/docs/intro/quickstart) by running:

```sh
git clone https://github.com/nonk123/no-bs.git
helm install -f values.yml my-instance ./no-bs
```

And once it's up, add the configured instance to your Xray client (...)

TODO: explain client configuration.

[^tls]: <https://github.com/XTLS/Xray-examples/blob/97d7f1ee192e9bb3bf07f165ee1af8ca12214fa3/VLESS-TCP-XTLS-Vision-REALITY/config_server.jsonc#L22>

## Tips and Tricks

### Fancy Usernames

You can use VLESS UUID mapping feature to generate a user ID that is equivalent to the username specified in this invocation:

```sh
xray uuid -i "your epic name"
```

This means the client would use `your epic name` for their UUID instead of the usual incomprehensible blob. And as far as I am aware, this supports Unicode too--go crazy with emojis!

### Import Existing Users from Hiddify

You can gather user IDs from Hiddify for use in `values.yml`. Here's how:

1. Create a Hiddify config backup in JSON format.
2. Feed the file into [`hiddify-import.py`](hiddify-import.py), e.g. on Linux:

   ```sh
   python hiddify-import.py < hiddify-backup.json
   ```

   Or on Windows (using PowerShell):

   ```pwsh
   cat hiddify-backup.json | py hiddify-import.py
   ```

3. The script should output a chunk of YAML with the `users` field that you can paste into `values.yml`.
