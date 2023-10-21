import { useQuery } from "urql"
import axios from "axios"
import { useCallback, useReducer, useState } from "react"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import ListItemText from "@mui/material/ListItemText"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import UpgradeIcon from "@mui/icons-material/Upgrade"

import { PrincipleCard, PrincipleIcon } from "../routes/Principles"
import { graphql } from "../gql"
import * as types from "../gql/graphql"
import Badge from "@mui/material/Badge"
import Avatar from "@mui/material/Avatar"

const API_URL = "http://localhost:8000"

const skillQueryDocument = graphql(`
    query Skills {
        skill {
            id
            level
            primary_principle {
                id
            }
            secondary_principle {
                id
            }
        }
    }
`)

type SkillAction = { type: "increment"; skill: types.Skill["id"] }

function skillReducer(
    state: types.SkillsQuery["skill"],
    action: SkillAction,
): types.SkillsQuery["skill"] {
    switch (action.type) {
        case "increment": {
            return state.map((skill) => {
                if (skill.id !== action.skill) return skill
                return {
                    ...skill,
                    level: skill.level + 1,
                }
            })
        }
    }
}

interface SkillProps extends types.Skill {
    onIncrement(): void
}

function Skill(props: SkillProps) {
    // TODO: move into reducer
    const [skill, setSkill] = useState(props)

    async function upgradeSkill() {
        const response = await axios.patch(`${API_URL}/skill/${props.id}`, {
            level: props.level + 1,
        })
        setSkill(response.data)
        props.onIncrement()
    }

    return (
        <ListItem>
            <ListItemIcon>
                <Stack direction="row" gap={2} sx={{ pr: 2 }}>
                    <Badge badgeContent={skill.level + 1} color="primary">
                        <PrincipleIcon id={skill.primary_principle!.id} />
                    </Badge>
                    <Badge badgeContent={skill.level} color="secondary">
                        <PrincipleIcon id={skill.secondary_principle!.id} />
                    </Badge>
                </Stack>
            </ListItemIcon>
            <ListItemText primary={skill.id} />
            <ListItemSecondaryAction>
                <ListItemButton onClick={upgradeSkill}>
                    <ListItemIcon>
                        <UpgradeIcon />
                    </ListItemIcon>
                </ListItemButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

const SkillsView = () => {
    // TODO: move into reducer
    const [{ data }] = useQuery({ query: skillQueryDocument })

    const [state, dispatch] = useReducer(skillReducer, data!.skill)

    const [open, setOpen] = useState(false)
    const [newSkill, setNewSkill] = useState<string | null>(null)

    const handleClickOpen = useCallback(() => {
        setOpen(true)
    }, [setOpen])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const handleSkillIncrement = useCallback(
        (skill: types.Skill["id"]) => {
            dispatch({ type: "increment", skill })
        },
        [dispatch],
    )
    const handleNewSkill = useCallback(
        (_event: React.SyntheticEvent, value: string | null) => {
            setNewSkill(value)
        },
        [setNewSkill],
    )
    // TODO: move into reducer
    const learnSkill = useCallback(() => {
        if (!newSkill) throw new Error("No skill selected")
        axios.patch(`${API_URL}/skill/${newSkill}`, { level: 1 }).then(() => {
            dispatch({ type: "increment", skill: newSkill })
            setOpen(false)
        })
    }, [dispatch, newSkill, setOpen])

    return (
        <List
            sx={{
                maxWidth: "800px",
                marginInline: "auto",
            }}
        >
            <ListItem>
                <ListItemButton>
                    <Button onClick={handleClickOpen}>Learn new Skill</Button>
                </ListItemButton>
                <Dialog open={open} onClose={handleClose}>
                    <DialogContent>
                        <Autocomplete
                            id="skill-selector"
                            options={state
                                .filter(({ level }) => level == 0)
                                .map((s) => s.id)}
                            sx={{ width: 300 }}
                            renderInput={(params) => (
                                <TextField {...params} label="Skill" />
                            )}
                            onChange={handleNewSkill}
                        />
                        <DialogActions>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button onClick={learnSkill} disabled={!newSkill}>
                                Learn
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>
            </ListItem>
            {state
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill
                        key={skill.id}
                        onIncrement={() => handleSkillIncrement(skill.id)}
                        {...skill}
                    />
                ))}
        </List>
    )
}

export default SkillsView
