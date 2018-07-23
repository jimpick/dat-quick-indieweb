# dat-quick-indieweb

Can we make an IndieWeb page with one click?

[https://dat-quick-indieweb.glitch.me/](https://dat-quick-indieweb.glitch.me/)

# Video demo

This demo was made on the second day of the [IndieWeb Summit 2018](https://indieweb.org/2018) in Portland, Oregon. Here's a video of the final project presentation:

* https://dat-quick-indieweb.glitch.me/

# Overview

This is a work-in-progress. This version is a technical prototype.

Uses indexeddb in the browser to store the master copy. Syncs via websocket to a node.js gateway running on glitch that can talk to the swarm. Supports multiple Dat archives ... you can republish, delete and also export them.

There's also a hard-coded connection to sync to a [pixelpusherd](https://github.com/automerge/pixelpusherd) instance I have running on a virtual machine on AWS, so the published Dats will stay online even when glitch puts the node.js gateway to sleep.

It works really well with [Hashbase](https://hashbase.io/). Just publish a quick website with this tool, and then go to hashbase to map it to a regular https url.

The UX on this version is really simple. I'm going to make another version with gentler onboard for those that are unfamiliar with Dat / Beaker / Hashbase.

I think the biggest missing feature is the ability to upload attachments for images, etc.

It's probably not a good idea to open the editor in multiple tabs in your browser ... the hypercores in the indexeddb might get corrupted.

For this style of publishing to be successful, I think there needs to be a way for users to publish from multiple devices. Right now, the master copy is stored in a single web browser, and it is pretty easy to forget which web browser / computer / website combo you used to publish from, which can be an issue if you want to update.

# License

MIT
