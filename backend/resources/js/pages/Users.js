/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import React, { useCallback, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast
} from '@chakra-ui/react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineEye,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlinePencil
} from 'react-icons/hi';
import { useQuery } from 'react-query';
import UserAPI from '../api/UserAPI';
import AdminAPI from '../api/AdminAPI';
import UserInfoFormDrawer from '../components/UserInfoFormDrawer';
import { getAvatarPath } from '../helper/helper';
import ChangePermissionMenu from '../components/ChangePermissionMenu';

const ConfirmToggleBlockUserModal = ({
  isOpen,
  onClose,
  isIntendBlock,
  selectedUser,
  refetch
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleToggleBlockUser = useCallback(() => {
    setIsSubmitting(true);
    AdminAPI.toggleBlockUser({
      userId: selectedUser.id,
      type: isIntendBlock ? 'block' : 'unblock'
    })
      .then((response) => {
        setIsSubmitting(false);
        toast({
          title: response.message,
          status: response.success ? 'success' : 'error',
          duration: 3000
        });
        onClose();
        refetch();
      })
      .catch(() => {
        setIsSubmitting(false);
        toast({
          title: 'Xảy ra lỗi không xác định',
          status: 'error',
          duration: 3000
        });
      });
  }, [isIntendBlock, onClose, refetch, selectedUser.id, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {`${isIntendBlock ? 'Khóa' : 'Mở khóa'} người dùng ${
            selectedUser.display_name
          }`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Hủy
          </Button>
          <Button
            colorScheme={isIntendBlock ? 'red' : 'green'}
            onClick={handleToggleBlockUser}
            isLoading={isSubmitting}
          >
            Xác nhận
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function Users() {
  const [page, setPage] = useState(1);
  const [searchString, setSearchString] = useState('');
  const [statusQuery, setStatusQuery] = useState('');
  const [isIntendBlock, setIsIntendBlock] = useState(true);
  const [selectedUser, setSelectedUser] = useState({});
  const [
    isOpenConfirmToggleBlockModal,
    setIsOpenConfirmToggleBlockModal
  ] = useState(false);
  const [
    isOpenUserInfoFormDrawer,
    setIsOpenUserInfoFormDrawer
  ] = useState(false);

  const toggleConfirmBlockModal = useCallback((type, user) => {
    if (type === 'block') {
      setIsIntendBlock(true);
    } else {
      setIsIntendBlock(false);
    }
    setSelectedUser(user);
    setIsOpenConfirmToggleBlockModal(true);
  }, []);

  const toggleUserInfoFormDrawer = useCallback((user) => {
    setSelectedUser(user);
    setIsOpenUserInfoFormDrawer((prev) => !prev);
  }, []);

  const { isLoading, data: usersData, refetch } = useQuery(
    ['users', page, searchString, statusQuery],
    () => AdminAPI.getAllUsers(page, searchString, statusQuery),
    { keepPreviousData: true }
  );

  const handleClickViewUser = useCallback(
    (id) => window.open(`/profile/${id}`),
    []
  );

  return (
    <Box
      paddingTop={8}
      paddingBottom={8}
      paddingInlineStart={8}
      paddingInlineEnd={8}
      marginInline="auto"
      marginTop="2rem"
      maxW="6xl"
      w="100%"
    >
      <ConfirmToggleBlockUserModal
        isOpen={isOpenConfirmToggleBlockModal}
        onClose={() =>
          setIsOpenConfirmToggleBlockModal((prev) => !prev)
        }
        isIntendBlock={isIntendBlock}
        selectedUser={selectedUser}
        refetch={refetch}
      />
      <UserInfoFormDrawer
        isOpen={isOpenUserInfoFormDrawer}
        onClose={() => setIsOpenUserInfoFormDrawer((prev) => !prev)}
        userData={selectedUser}
        refetch={refetch}
        isAdmin
      />
      <Flex background="white" boxShadow="sm" borderRadius="lg">
        <TableContainer whiteSpace="unset" w="full">
          <Flex padding={6} justifyContent="space-between">
            <Text fontWeight="600" fontSize="xl">
              Danh sách người dùng
            </Text>
          </Flex>
          <Flex
            justifyContent="flex-end"
            gap={3}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Input
              placeholder="Search by name"
              size="sm"
              w="13%"
              onChange={(e) => setSearchString(e.target.value)}
            />
            <Select
              size="sm"
              w="17%"
              mr={6}
              mb={3}
              onChange={(e) => {
                setStatusQuery(e.target.value);
              }}
            >
              {[
                { name: 'All', id: 'all' },
                { name: 'Block', id: 'blocked' },
                { name: 'Active', id: 'active' }
              ].map(({ name, id }) => (
                <option key={`category-filter-${id}`} value={id}>
                  {name}
                </option>
              ))}
            </Select>
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tên</Th>
                <Th>Trạng thái</Th>
                <Th>Email</Th>
                <Th>Về tôi</Th>
                <Th>Thao tác</Th>
              </Tr>
            </Thead>
            {isLoading ? (
              <Tbody>
                <Tr>
                  <Td>
                    <Spinner mt={2} ml={2} />
                  </Td>
                </Tr>
              </Tbody>
            ) : (
              <Tbody>
                {usersData?.data?.length > 0 &&
                  usersData.data.map((user, i) => (
                    <Tr key={`user-${i + 1}`}>
                      <Td>
                        <Flex alignItems="center" gap={3}>
                          <Avatar
                            bg="purple.200"
                            size="md"
                            src={getAvatarPath(user.avatar?.name)}
                          />
                          <Text fontWeight={500}>
                            {user.display_name}
                          </Text>
                        </Flex>
                      </Td>
                      <Td>
                        <Badge
                          fontSize="14px"
                          borderRadius="lg"
                          textTransform="lowercase"
                          colorScheme={
                            user.status === 'active' ? 'green' : 'red'
                          }
                        >
                          {user.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Text color="gray.600">{user.email}</Text>
                      </Td>
                      <Td>
                        <Text color="gray.600">{user.about}</Text>
                      </Td>
                      <Td>
                        <Flex gap={1}>
                          <IconButton
                            icon={<HiOutlineEye />}
                            fontSize="20px"
                            onClick={() =>
                              handleClickViewUser(user.id)
                            }
                          />
                          <IconButton
                            icon={<HiOutlinePencil />}
                            fontSize="20px"
                            onClick={() =>
                              toggleUserInfoFormDrawer(user)
                            }
                          />
                          {user.status === 'blocked' ? (
                            <IconButton
                              colorScheme="green"
                              icon={<HiOutlineLockOpen />}
                              fontSize="20px"
                              onClick={() =>
                                toggleConfirmBlockModal(
                                  'unblock',
                                  user
                                )
                              }
                            />
                          ) : (
                            <IconButton
                              colorScheme="red"
                              icon={<HiOutlineLockClosed />}
                              fontSize="20px"
                              onClick={() =>
                                toggleConfirmBlockModal('block', user)
                              }
                            />
                          )}
                          <ChangePermissionMenu
                            canCreatePost={user?.canCreatePost}
                            canEditPost={user?.canEditPost}
                            canComment={user?.canComment}
                            canVote={user?.canVote}
                            userId={user?.id}
                            refetch={refetch}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            )}
          </Table>
          {!isLoading && usersData?.data?.length === 0 ? (
            <Box textAlign="center" p="20px	100px" color="gray.800">
              Chưa có người dùng
            </Box>
          ) : (
            <Flex justifyContent="space-between" px={6} py={2}>
              <Button
                leftIcon={<HiChevronLeft />}
                onClick={() => setPage((old) => Math.max(old - 1, 0))}
                isDisabled={!usersData?.prev_page_url}
              >
                Trước
              </Button>
              <Button
                rightIcon={<HiChevronRight />}
                onClick={() => setPage((old) => old + 1)}
                isDisabled={!usersData?.next_page_url}
              >
                Sau
              </Button>
            </Flex>
          )}
        </TableContainer>
      </Flex>
    </Box>
  );
}
