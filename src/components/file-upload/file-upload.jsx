import { memo, useRef, useState } from 'react'

import styled from '@emotion/styled'
import {
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  IconButton,
  Typography
} from '@mui/material'
import { Stack } from '@mui/system'
import CloseIcon from 'icons/close'
import Image from 'next/image'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { useController, useFormContext } from 'react-hook-form'

const FormField = styled.input`
  font-size: 18px;
  display: block;
  width: 100%;
  border: none;
  text-transform: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;

  &:focus {
    outline: none;
  }
`
const MEGA_BYTES_PER_BYTE = 1024 * 1024
const DEFAULT_MAX_FILE_SIZE_IN_MB = 10
const DEFAULT_MAX_FILE_SIZE_IN_BYTES = DEFAULT_MAX_FILE_SIZE_IN_MB * MEGA_BYTES_PER_BYTE

const convertNestedObjectToArray = nestedObj => Object.keys(nestedObj).map(key => nestedObj[key])

const renderFileUrl = file => {
  if ('secure_url' in file) {
    return file.secure_url
  }

  return URL.createObjectURL(file)
}

const FilePreviewCard = memo(({ index, file, onRemove }) => {
  return (
    <Draggable draggableId={file.name} index={index}>
      {(provided, snapshot) => (
        <Box
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ marginBottom: 2 }}
        >
          <Card
            sx={{
              minHeight: '50px',
              width: '100%',
              padding: '10px',
              cursor: snapshot.isDragging ? 'grab' : 'pointer!important'
              // ...provided.draggableProps.style
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Stack direction={'row'} alignItems="center" spacing={2}>
                <Box sx={{ position: 'relative', minHeight: 100, minWidth: 150 }}>
                  <Image
                    alt={file.name}
                    src={renderFileUrl(file)}
                    style={{
                      borderRadius: 6,
                      width: '100%',
                      maxHeight: '100%',
                      objectFit: 'cover'
                    }}
                    fill
                  />
                </Box>
                <Typography>{file.name === '' ? 'Untitled' : file.name}</Typography>
              </Stack>

              <IconButton color="default" onClick={onRemove}>
                <CloseIcon width={24} height={24} />
              </IconButton>
            </Box>
          </Card>
        </Box>
      )}
    </Draggable>
  )
})

const FileUpload = ({
  name,
  label,
  multiple = true,
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  ...otherProps
}) => {
  const { control } = useFormContext()
  const fileInputField = useRef(null)
  const {
    field: { value, onChange, onBlur },
    fieldState: { error }
  } = useController({
    name,
    control
  })

  const handleUploadBtnClick = () => {
    fileInputField.current.click()
  }

  const addNewFiles = newFiles => {
    const oldFiles = [...value]
    const acceptedFiles = newFiles.filter(file => (file.size <= maxFileSizeInBytes ? true : false))
    const updatedFiles = oldFiles.concat(acceptedFiles)

    if (!multiple) {
      return [updatedFiles[0]]
    }

    return updatedFiles
  }

  const handleNewFileUpload = e => {
    const { files: newFiles } = e.target

    if (newFiles.length) {
      const filesAsArray = convertNestedObjectToArray(newFiles)

      let updatedFiles = addNewFiles(filesAsArray)
      updateFiles(updatedFiles)
    }
  }

  const updateFiles = newFiles => {
    onChange(newFiles)
    // setFiles(newFiles)
    // updateFilesCb(newFiles)
  }

  const removeFile = index => () => {
    if (index < value.length) {
      const newFiles = [...value]
      newFiles.splice(index, 1)
      updateFiles(newFiles)
    }
  }

  const onDragEnd = async ({ source, destination }) => {
    if (!destination) return

    const fromIndex = source.index
    const toIndex = destination.index

    const updatedFiles = [...value]
    const element = updatedFiles.splice(fromIndex, 1)[0]

    updatedFiles.splice(toIndex, 0, element)
    updateFiles(updatedFiles)
  }

  return (
    <FormControl error={!!error} sx={{ width: '100%' }}>
      <Box
        sx={{
          position: 'relative',
          margin: '25px 0 0',
          border: '1px dashed',
          borderColor: !error ? 'lightgray' : '#f44336',
          padding: '35px 20px',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography
          sx={{
            top: -25,
            color: 'black',
            left: 0,
            position: 'absolute'
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontWeight: '500', marginTop: 0, textAlign: 'center' }}>
          Drag and drop your files here
        </Typography>
        <Typography
          variant="subtitle1"
          //  sx={{ fontWeight: '400', marginTop: 0, textAlign: 'center' }}
        >
          Max size: {DEFAULT_MAX_FILE_SIZE_IN_MB}MB
        </Typography>
        {/* <Button onClick={handleUploadBtnClick}>Upload {multiple ? 'files' : 'a file'}</Button> */}
        <FormField
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          multiple={multiple}
          {...otherProps}
        />
      </Box>
      <FormHelperText>{error?.message}</FormHelperText>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable direction="vertical" droppableId={'file-upload'}>
          {provided => (
            <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ width: '100%' }}>
              {value.map((file, index) => {
                {
                  /* let isImageFile = file.type.split('/')[0] === 'image' */
                }

                return (
                  <FilePreviewCard
                    key={`${file.name}_${index}`}
                    index={index}
                    file={file}
                    onRemove={removeFile(index)}
                  />
                )
              })}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </FormControl>
  )
}

export default FileUpload
