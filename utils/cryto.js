"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var util_1 = require("util");
var generateKeyPair = (0, util_1.promisify)(crypto_1.generateKeyPairSync);
var CryptoService = /** @class */ (function () {
    function CryptoService() {
        var _a = (0, crypto_1.generateKeyPairSync)('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        }), publicKey = _a.publicKey, privateKey = _a.privateKey;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }
    CryptoService.prototype.getPublicKey = function () {
        return this.publicKey;
    };
    CryptoService.prototype.encrypt = function (publicKey, data) {
        var buffer = Buffer.from(data, 'utf8');
        var encrypted = (0, crypto_1.publicEncrypt)(publicKey, buffer);
        return encrypted.toString('base64');
    };
    CryptoService.prototype.decrypt = function (encryptedData) {
        var buffer = Buffer.from(encryptedData, 'base64');
        var decrypted = (0, crypto_1.privateDecrypt)({
            key: this.privateKey,
        }, buffer);
        return decrypted.toString('utf8');
    };
    CryptoService.prototype.sign = function (data) {
        var signer = (0, crypto_1.createSign)('RSA-SHA256');
        signer.update(data);
        return signer.sign(this.privateKey, 'base64');
    };
    CryptoService.prototype.verify = function (publicKey, data, signature) {
        var verifier = (0, crypto_1.createVerify)('RSA-SHA256');
        verifier.update(data);
        return verifier.verify(publicKey, signature, 'base64');
    };
    return CryptoService;
}());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var alice, bob, secretMessage, encrypted, decrypted, contract, signature, isValid;
    return __generator(this, function (_a) {
        alice = new CryptoService();
        bob = new CryptoService();
        secretMessage = "Hey Bob, let's meet at 5pm! 🔐";
        console.log("Original message:", secretMessage);
        encrypted = alice.encrypt(bob.getPublicKey(), secretMessage);
        console.log("Encrypted message:", encrypted);
        decrypted = bob.decrypt(encrypted);
        console.log("Decrypted message:", decrypted);
        contract = "I agree to pay $100";
        signature = alice.sign(contract);
        console.log("Signature:", signature);
        isValid = bob.verify(alice.getPublicKey(), contract, signature);
        console.log("Signature valid?", isValid);
        return [2 /*return*/];
    });
}); })();
