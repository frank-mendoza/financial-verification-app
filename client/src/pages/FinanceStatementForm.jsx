import {
  Button,
  Dialog,
  Field,
  Flex,
  Grid,
  Heading,
  NumberInput,
  Portal,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { CloseButton } from "../components/ui/close-button";

const FinanceStatementForm = () => {
  const {
    // register,
    handleSubmit,
    // formState: { errors },
  } = useForm();

  const onSubmit = handleSubmit((data) => console.log(data));

  const formFields = [
    {
      label: "Cash on Hand",
      id: "cashOnHand",
    },
    {
      label: "Cash in Bank",
      id: "cashInBank",
    },
    {
      label: "Notes Receivable",
      id: "notesReceivable",
    },
    {
      label: "Receivable from Officers/Adviser",
      id: "fromOfficers",
    },
    {
      label: "Receivable from Members",
      id: "fromMembers",
    },
  ];
  return (
    <Portal>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Flex justifyContent={"space-between"}>
              <Dialog.Title fontSize={"xl"}>
                Fill up financial statement form
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Flex>
          </Dialog.Header>
          <Dialog.Body>
            <form onSubmit={onSubmit}>
              <Heading size={"lg"} mb={5}>
                Current Assets
              </Heading>
              <Grid templateColumns="repeat(3, 1fr)" gap="6">
                {formFields.map((fld, idx) => (
                  <Field.Root key={idx} required>
                    <Field.Label>
                      {fld.label}
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <NumberInput.Root defaultValue="" width="200px">
                      {/* <NumberInput.Control /> */}
                      <NumberInput.Input placeholder={`Enter ${fld.label}`} />
                    </NumberInput.Root>
                  </Field.Root>
                ))}
              </Grid>
            </form>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline">Close</Button>
            </Dialog.ActionTrigger>

            <Dialog.Trigger asChild>
              <Button>Export Financial Statement</Button>
            </Dialog.Trigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Portal>
  );
};
export default FinanceStatementForm;
