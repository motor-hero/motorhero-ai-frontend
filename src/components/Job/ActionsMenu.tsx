import {
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiPlay, FiTrash } from "react-icons/fi";
import RunJobModal from "./RunJob";
import Delete from "../Common/DeleteAlert";

interface ActionsMenuProps {
    type: string;
    value: any;
    disabled?: boolean;
}

const ActionsMenuJob = ({ type, value, disabled }: ActionsMenuProps) => {
    const runJobModal = useDisclosure();
    const deleteModal = useDisclosure();

    return (
        <>
            <Menu>
                <MenuButton
                    isDisabled={disabled}
                    as={Button}
                    rightIcon={<BsThreeDotsVertical />}
                    variant="unstyled"
                />
                <MenuList>
                    <MenuItem
                        onClick={runJobModal.onOpen}
                        icon={<FiPlay fontSize="16px" />}
                    >
                        Executar {type}
                    </MenuItem>
                    <MenuItem
                        onClick={deleteModal.onOpen}
                        icon={<FiTrash fontSize="16px" />}
                        color="ui.danger"
                    >
                        Deletar {type}
                    </MenuItem>
                </MenuList>

                <RunJobModal
                    job={value}
                    isOpen={runJobModal.isOpen}
                    onClose={runJobModal.onClose}
                />

                <Delete
                    type={type}
                    id={value.id}
                    isOpen={deleteModal.isOpen}
                    onClose={deleteModal.onClose}
                />
            </Menu>
        </>
    );
};

export default ActionsMenuJob;
