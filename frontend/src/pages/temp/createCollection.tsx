import React from "react";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useCreateAssetMutation } from "../../hooks/mutation/createAssetMutation";
import { useEthers } from "@usedapp/core";
import { GetUserAssetsQueryGQL } from "../../hooks/query/useGetUserAssetsQuery";

export default function CreateCollection() {
  // const [logoImageFile, setLogoImageFile] = React.useState();
  // const [featuredImageFile, setFeaturedImageFile] = React.useState();
  const [logoFile, setLogoFile] = React.useState();
  const [name, setName] = React.useState("");
  // const [url, setUrl] = React.useState("");
  const [desc, setDesc] = React.useState("");
  // const [category, setCategory] = React.useState();
  // const [links, setLinks] = React.useState();
  // const [creatorFee, setCreateFee] = React.useState();
  // const [paymentToken, setPaymentToken] = React.useState("BOA");

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setName(event.target.value);
  const handleDescChange = (event: any) => setDesc(event.target.value);

  const { createAssetMutation } = useCreateAssetMutation();

  const { account } = useEthers();

  const onCreate = (event: any) => {
    console.log("event :", event);
    console.log("name :", name);
    console.log("desc :", desc);

    createAssetMutation({
      variables: {
        imageFile: logoFile,
        name,
        description: desc,
        address: account,
        contract: "0x00",
      },
      onCompleted(data: any) {
        console.log("createAssetMutation >:", data);
      },
      onError(err: any) {
        console.log("createAssetMutation > error:", err);
      },
      refetchQueries: [
        // mutation 완료 후 재요청할 쿼리 목록
        { query: GetUserAssetsQueryGQL, variables: { address: account } },
      ],
    });
  };

  const handleFileChange = ({
    target: {
      validity,
      files: [file],
    },
  }: any) => validity.valid && setLogoFile(file);

  return (
    <React.Fragment>
      <Box borderRadius="lg" p={8} shadow="base">
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <InputGroup>
              <Input type="text" onChange={handleNameChange} name="name" placeholder="Your Name" />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="message"
              onChange={handleDescChange}
              placeholder="Your Message"
              rows={6}
              resize="none"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>LOGO Image</FormLabel>
            <input type="file" required onChange={handleFileChange} />
          </FormControl>

          <Button
            colorScheme="blue"
            bg="blue.400"
            color="white"
            _hover={{
              bg: "blue.500",
            }}
            onClick={onCreate}
          >
            Create
          </Button>
        </VStack>
      </Box>
    </React.Fragment>
  );
}
