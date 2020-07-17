#!/bin/bash

printf "Compiling protobuf definitions:\033[0;32m Cloudstate & Google\033[0m\n"

OUT_DIR="./src/_proto"
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"

mkdir -p ${OUT_DIR}

protoc \
    --proto_path="node_modules/cloudstate/proto" \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    node_modules/cloudstate/proto/google/api/httpbody.proto \
    node_modules/cloudstate/proto/google/api/http.proto \
    node_modules/cloudstate/proto/google/api/annotations.proto \
    node_modules/cloudstate/proto/cloudstate/entity_key.proto

printf "Compiling protobuf definitions (Chat dependent services):\033[0;32m Friends & Presence\033[0m\n"

protoc \
    --proto_path=./chatapp_protos \
    --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="service=grpc-web:${OUT_DIR}" \
    -I node_modules/cloudstate/proto/ \
    friends.proto presence.proto
