import dotenv from "dotenv";
import admin from "firebase-admin";
dotenv.config();
const { private_key } = JSON.parse(process.env.PRIVATE_KEY);
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
};
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebase = admin.firestore(app);

export async function fetchProducts() {
  return await firebase.collection("/products").get();
}

export function processProducts(products) {
  const categories = {};

  products.docs.forEach((product) => {
    const productData = product.data();
    categories[`${productData.category.id}-${product.id}`] = {
      images: productData.photos,
      name: productData.title,
      priceInCents: parseFloat(productData.price) * 100,
    };
  });

  return categories;
}
export async function addOrder(
  orderId,
  address,
  items,
  priceInCents,
  customerId
) {
  firebase.collection("orders").doc(orderId).create({
    address,
    items,
    priceInCents,
    customerId,
    isPayed: false,
  });
}
export async function getProductPrice() {
  const products = await fetchProducts();
  return processProducts(products);
}

export async function getOrder(orderId) {
  const res = await firebase.collection("orders").doc(orderId).get();
  return res.data();
}

export async function updateOrder(orderId, order) {
  const res = await firebase
    .collection("orders")
    .doc(orderId)
    .update({
      ...order,
      isPayed: true,
    });
  return res;
}
export async function verfiyOrder(orderId) {
  const order = await getOrder(orderId);
  if (!order) return "not found";
  await updateOrder(orderId, order);
}
