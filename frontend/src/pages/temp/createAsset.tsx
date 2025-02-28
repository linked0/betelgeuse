import React, { useState } from "react";

import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import { useCreateAssetMutation } from "../../hooks/mutation/createAssetMutation";
import { FormikErrors, useFormik } from "formik";
import { GetUserAssetsQueryGQL } from "../../hooks/query/useGetUserAssetsQuery";
import { ImprotNFTAlert } from "../../components/Modals/ImportNFT";
import { AddressZero } from "@ethersproject/constants/src.ts/addresses";
import ImageDropZone from "../../components/DragBox/ImageDropZone";

interface FormValues {
  name: string;
  imageFile: File;
  description: string;
  totalSupply: number;
  address: string;
  contract: string;
}
export default function CreateAsset() {
  const { account } = useEthers();
  const { createAssetMutation } = useCreateAssetMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      imageFile: undefined,
      description: "",
      totalSupply: 100,
      address: account,
      contract: AddressZero,
    },
    onSubmit: (values: FormValues) => {
      createAssetMutation({
        variables: { ...values, address: account },
        onCompleted(data: any) {
          console.log("createAssetMutation >:", data);
          if (data.createItemMutation.success) {
            setSuccess(true);
          } else {
            setSuccess(true);
          }
          onOpen();
        },
        onError(err: any) {
          console.log("createAssetMutation > error:", err);
          setSuccess(true);
          onOpen();
        },
        refetchQueries: [
          // mutation 완료 후 재요청할 쿼리 목록
          { query: GetUserAssetsQueryGQL, variables: { userAddress: account } },
        ],
      });
    },
    validateOnBlur: true,
    validateOnChange: true,
    // Add a custom validation function (this can be async too!)
    validate: (values: FormValues) => {
      let errors: FormikErrors<FormValues> = {};
      errors = {};
      if (!values.name) {
        errors.name = "Please enter the name required.";
      } else if (!values.imageFile) {
        errors.imageFile = "Please select the image required.";
      }
      return errors;
    },
  });
  return (
    <React.Fragment>
      <Box borderRadius="lg" p={8} shadow="base">
        <VStack spacing={5}>
          <form onSubmit={formik.handleSubmit}>
            <FormControl
              isRequired
              mb={["20px"]}
              isInvalid={!!formik.errors.name && !!formik.touched.name}
            >
              <FormLabel htmlFor="name" fontSize={["18px", "18px", "16px"]} fontWeight="500">
                Name
              </FormLabel>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="name"
                _placeholder={{ opacity: 0.75, color: "inherit" }}
                h={["58px", "58px", "58px", "50px"]}
                onChange={formik.handleChange}
                value={formik.values.name}
              />
              <FormErrorMessage>
                <FormHelperText
                  mt={"16px"}
                  fontSize={["15px", "15px", "14px"]}
                  fontWeight="400"
                  lineHeight="12px"
                  color="#ff204a"
                >
                  {formik.errors.name}
                </FormHelperText>
              </FormErrorMessage>
            </FormControl>
            <FormControl
              isRequired
              mb={["20px"]}
              isInvalid={!!formik.errors.imageFile && !!formik.touched.imageFile}
            >
              <FormLabel htmlFor="imageFile" fontSize={["18px", "18px", "16px"]} fontWeight="500">
                Image
              </FormLabel>
              <ImageDropZone
                onChange={<T extends File>(file: T) => formik.setFieldValue("imageFile", file)}
              />
              <FormErrorMessage>
                <FormHelperText
                  mt={"16px"}
                  fontSize={["15px", "15px", "14px"]}
                  fontWeight="400"
                  lineHeight="12px"
                  color="#ff204a"
                >
                  {formik?.errors?.imageFile as string}
                </FormHelperText>
              </FormErrorMessage>
            </FormControl>
            <FormControl mb={["20px"]}>
              <FormLabel htmlFor="desc" fontSize={["18px", "18px", "16px"]} fontWeight="500">
                Description
              </FormLabel>
              <Input
                id="desc"
                name="description"
                type="text"
                multiple
                placeholder="description"
                _placeholder={{ opacity: 0.75, color: "inherit" }}
                h={["58px", "58px", "58px", "50px"]}
                onChange={formik.handleChange}
                value={formik.values.description}
              />
            </FormControl>

            <VStack
              spacing={[3, 3, 3, 2]}
              align="stretch"
              mt={["40px", "40px", "40px", "46px", "43px", "56px"]}
            >
              <Button type="submit" size={{ base: "lg", md: "md" }}>
                Create
              </Button>
            </VStack>
          </form>
        </VStack>
        <ImprotNFTAlert isOpen={isOpen} success={success} handleClose={onClose} />
      </Box>
    </React.Fragment>
  );
}
