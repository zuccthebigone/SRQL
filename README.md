# SRQL

A P2P file sharing platform for students.

## Installation

### Prerequisites
- Node.js `^6.9.0`

### Steps

Download/clone repository:
```
git clone https://github.com/zuccthebigone/SRQL.git
```

Navigate to base directory:
```
cd SRQL
```
Install dependencies:
```
npm install
```
Run application:
```
npm start
```

## Dependencies

### Base

Package | Version
-- | --
`electron` | `8.1.1`
`jquery` | `3.4.1`
`pg` | `7.18.2`
`uuid` | `7.0.2`
`string-similarity` | `4.0.1`
`textarea-caret` | `3.1.0`

### Dev

Package | Version
-- | --
`electron` | `8.1.1`
`csvtojson` | `2.0.10`
`mocha` | `7.1.1`
`rewire` | `5.0.0`

---

## Usage

### Reference

Keyword | Action
-- | --
`@USERNAME` | Display the profile of a visible user
`@SRQLNAME` | Display the home page of a visible SRQL


### Commands

Keyword | Action
-- | --
`/add USERNAME [SRQLNAME]` | Add user to a SRQL (current SRQL if empty)
`/create SRQLNAME [OPTIONS]` <br> `OPTIONS` <br> &emsp; `-v, --visible` <br> &emsp; `-h, --hidden` <br> &emsp; `-u, --users <usernames>` | Create a visible or hidden SRQL and add users as members

---

## Contributors

- [zuccthebigone](https://github.com/zuccthebigone)
- [p4r17y817](https://github.com/p4r17y817)
