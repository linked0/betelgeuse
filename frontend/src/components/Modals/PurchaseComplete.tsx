import React from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spacer,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import ThumbRatio from "../ThumbRatio";
import { Link, useNavigate } from "react-router-dom";

interface ModalProp {
  isOpen: boolean;
  onClose(): void;
  asset?: any;
  complete?(): void;
}
export const PurchaseComplete = ({ isOpen, onClose, asset }: ModalProp) => {
  const navigate = useNavigate();
  const handlerOnPurchase = () => {
    onClose();
    navigate("/my");
  };
  return (
    <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="546px" pl="0" pr="3px">
        <ModalCloseButton />
        <ModalBody px="30px" py="27px">
          <Box w="184px" h="184px" mx="auto" bg="#8F8DB1" borderRadius="12px">
            <ThumbRatio src={asset?.originalUrl} />
          </Box>
          <Box mt="25px">
            <Text variant="txt246" color="White">
              Your purchase is complete
            </Text>
            <HStack
              divider={<StackDivider h="12px" mt="8px !important" borderColor="#616086" />}
              justify="center"
              align="center"
              mt="10px"
              spacing="10px"
            >
              <Link to="#" style={{ color: "#A796FF", fontSize: "15px", fontWeight: "400" }}>
                View on BOAscan
              </Link>
              <Link to="#" style={{ color: "#A796FF", fontSize: "15px", fontWeight: "400" }}>
                Show details
              </Link>
            </HStack>
          </Box>
          <Box mt="20px">
            <Flex>
              <Text variant="txt174" color="White">
                Subtotal
              </Text>
              <Spacer />
              <Text variant="txt176" color="text_Gray02">
                0.0001 BOA
              </Text>
            </Flex>
            <Flex>
              <Text variant="txt174" color="White">
                Gas fees
              </Text>
              <Spacer />
              <Text variant="txt176" color="text_Gray02">
                0.0024 BOA
              </Text>
            </Flex>
            <Divider borderColor="popup_B01" mt="23px" mb="20px" />
            <Flex>
              <Text variant="txt205" color="White">
                Total price
              </Text>
              <Spacer />
              <Box textAlign="right">
                <Text variant="txt206" color="White">
                  0.0025 BOA
                </Text>
                <Text variant="txt154" mt="5px" color="text_Gray02">
                  $1,286.79
                </Text>
              </Box>
            </Flex>

            <Button variant="primary" w="100%" mt="30px" onClick={handlerOnPurchase}>
              View purchase
            </Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
