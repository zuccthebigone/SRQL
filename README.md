# SRQL

A P2P file sharing platform for students.

## Installation

## Dependencies
Dev | Version | Package
-- | -- | --
✓ | 8.1.1 | electron
✗ | 3.4.1 | jquery
✗ | 7.18.2 | pg
✗ | 7.0.2 | uuid
✗ | 4.0.1 | string-similarity
✗ | 3.1.0 | textarea-caret
✓ | 2.0.10 | csvtojson
✓ | 7.1.1 | mocha
✓ | 5.0.0 | rewire


## Info

Keyword | Action
-- | --
`@USERNAME` | Display the profile of a visible user
`@SRQLNAME` | Display the home page of a visible SRQL


## Commands

Keyword | Action
-- | --
`/add USERNAME [SRQLNAME]` | Add user to a SRQL (current SRQL if empty)
`/create SRQLNAME [OPTIONS]` <br> `OPTIONS` <br> &emsp; `-v, --visible` <br> &emsp; `-h, --hidden` <br> &emsp; `-u, --users <usernames>` | Create a visible or hidden SRQL and add users as members
