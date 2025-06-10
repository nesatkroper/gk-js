import { generateKeyPairSync, publicEncrypt, privateDecrypt, createSign, createVerify } from 'crypto';
import { promisify } from 'util';


const generateKeyPair = promisify(generateKeyPairSync);

class CryptoService {
  private publicKey: string;
  private privateKey: string;

  constructor() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      }
    });

    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  encrypt(publicKey: string, data: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  }

  decrypt(encryptedData: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = privateDecrypt(
      {
        key: this.privateKey,
      },
      buffer
    );
    return decrypted.toString('utf8');
  }

  sign(data: string): string {
    const signer = createSign('RSA-SHA256');
    signer.update(data);
    return signer.sign(this.privateKey, 'base64');
  }

  verify(publicKey: string, data: string, signature: string): boolean {
    const verifier = createVerify('RSA-SHA256');
    verifier.update(data);
    return verifier.verify(publicKey, signature, 'base64');
  }
}

(async () => {
  const alice = new CryptoService();
  const bob = new CryptoService();
  const secretMessage = "Hey Bob, let's meet at 5pm! 🔐";
  console.log("Original message:", secretMessage);

  const encrypted = alice.encrypt(bob.getPublicKey(), secretMessage);
  console.log("Encrypted message:", encrypted);


  const decrypted = bob.decrypt(encrypted);
  console.log("Decrypted message:", decrypted);


  const contract = "I agree to pay $100";
  const signature = alice.sign(contract);
  console.log("Signature:", signature);

  const isValid = bob.verify(alice.getPublicKey(), contract, signature);
  console.log("Signature valid?", isValid);
})();