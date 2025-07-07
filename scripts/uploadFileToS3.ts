import fs from "fs";
import {S3Client} from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";

import dotenv from "dotenv";
dotenv.config();

const BUCKET_NAME = process.env.MINIO_BUCKET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;

console.log('AWS_ACCESS_KEY_ID: ', AWS_ACCESS_KEY_ID)
console.log('AWS_SECRET_ACCESS_KEY: ', AWS_SECRET_ACCESS_KEY)

interface Params {
  pathToLocalFile: string;
  key: string;
}

export async function uploadFileToS3({pathToLocalFile, key}: Params) {
  const s3Client = new S3Client({
    endpoint: MINIO_ENDPOINT,
    forcePathStyle: true,
    region: "ap-northeast-2", // minio는 이거 무시함
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SECRET_ACCESS_KEY!,
    },
  });

  const fileStream = fs.createReadStream(pathToLocalFile);

  const uploader = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileStream,
      ACL: "public-read",
      CacheControl: "no-store", // FIXME: 일단 CDN 없으니 Cache 안하게
    },
  });

  const {Location} = await uploader.done();
  console.log(`log: 🎉 File uploaded successfully [${Location}]`);
}
