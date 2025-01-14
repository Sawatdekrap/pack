import { Alert, Button, Flex, Group, Modal, Text } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconExclamationCircle, IconUpload } from "@tabler/icons-react";
import { useState } from "react";
import * as Papa from "papaparse";

interface CSVImportModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (data: any[]) => void;
  onValidate: (data: any[]) => [any[], string];
}

function CSVImportModal({
  opened,
  onClose,
  title,
  onSubmit,
  onValidate,
}: CSVImportModalProps) {
  const [data, setData] = useState<any[] | undefined>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onDrop = async (files: FileWithPath[]) => {
    setData(undefined);
    setLoading(true);
    const file = files[0];
    file
      .text()
      .then((text) => {
        setData(undefined);
        setError("");
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete(results) {
            if (results.data) {
              const [validatedData, validateError] = onValidate(results.data);
              validateError ? setError(validateError) : setData(validatedData);
            } else {
              setError("Incomplete CSV");
            }
          },
          error(error: Error) {
            setError(`Error parsing csv: ${error.message}`);
          },
        });
      })
      .catch((e) => {
        console.log("error");
        setError(`Error reading file: ${e.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const submit = () => {
    if (data === undefined) return;
    onSubmit(data);
    onClose();
  };

  const close = () => {
    setError("");
    setData(undefined);
    setLoading(false);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={close} title={title} size="xl">
      <Dropzone
        maxFiles={1}
        onDrop={onDrop}
        onReject={() => {
          setError("Unable to use files");
        }}
        accept={["text/csv"]}
        loading={loading}
      >
        <Group justify="center" mih={220} style={{ pointerEvents: "none" }}>
          <IconUpload style={{ width: "3rem", height: "3rem" }} stroke={1.5} />
          <Flex direction={"column"}>
            <Text size="lg" inline>
              Drag CSV or click to select file
            </Text>
            <Text size="sm" c="dimmed" inline mt={7}>
              Test long sentence here
            </Text>
          </Flex>
        </Group>
      </Dropzone>
      {error && (
        <Alert
          variant="light"
          color="red"
          title="CSV Import Error"
          icon={<IconExclamationCircle />}
          mt="md"
        >
          {error}
        </Alert>
      )}
      {data && (
        <Alert
          variant="light"
          color="blue"
          title="Data import ready"
          icon={<IconExclamationCircle />}
          mt="md"
        >
          Ready to import {data.length} rows
        </Alert>
      )}
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={close}>
          Cancel
        </Button>
        <Button disabled={data === undefined} onClick={submit}>
          Import
        </Button>
      </Group>
    </Modal>
  );
}

export default CSVImportModal;
