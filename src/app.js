require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const addressBook = [
    {
        "id": "3c8da4d5-1597-46e7-baa1-e402aed70d80",
        "firstName": "Ash",
        "lastName": "Kethcum",
        "address1": "Anime",
        "address2": "WhatsHeLookLikeNow",
        "city": "Pallet Town",
        "state": "KA",
        "zip": "30492"
    },
    {
        "id": "ce20079c-2326-4f17-8ac4-f617bfd28b7f",
        "firstName": "Mega",
        "lastName": "Charizard X",
        "address1": "Ultra Ball",
        "city": "Unknown",
        "state": "JO",
        "zip": "12345"
    }

]

const morganOption = (NODE_ENV === 'production')
  ? 'dev'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    };
    
    next()
})

app.get('/address', (req, res) => {
    res
        .json(addressBook);
})

app.post('/address', (req, res) => {
    const { firstName, lastName, address1, address2=false, city, state, zip } = req.body;

    if (!firstName) {
        return res
            .status(400)
            .send('A first name is required')
    };

    if (!lastName) {
        return res 
            .status(400)
            .send('A last name is required')
    };

    if (!address1) {
        return res 
            .status(400)
            .send('An address is required')
    };

    if (!city) {
        return res 
            .status(400)
            .send('A city is required')
    }

    if (!state) {
        return res 
            .status(400)
            .send('A state is required')
    }

    if (!zip) {
        return res 
        .status(400)
        .send('A zip code is required')
    }

    if (state.length !== 2) {
        return res 
            .status(400)
            .send('A valid 2 character state code is required')
    }

    if (isNaN(zip) || zip.length !== 5) {
        return res 
            .status(400)
            .send('A 5 digit zip code is required')    
    }

    const id = uuid();
    const newAddress = {
        id,
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zip
    };

    addressBook.push(newAddress);

    res
        .status(201)
        .location(`http://localhost:8000/address/${id}`)
        .json(newAddress)
})

app.delete('/address/:addressId', (req, res) => {
    const { addressId } = req.params;
    
    const index = addressBook.findIndex(add => add.id === addressId);

    if(index === -1) {
        return res
            .status(404)
            .send('User not found');
    }

    addressBook.splice(index, 1);

    res.send('Deleted')
})

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { error: { messages: 'server error' } };
    } else {
        console.error(error)
        response = { message: error.message, error };
    }
    res.status(500).json(response);
})

module.exports = app