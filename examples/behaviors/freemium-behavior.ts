import { createBehavior } from "@app/use-cases/create-behavior"
import { FreemiumSituationMapper } from "examples/behaviors/freemium-mapper"
import { inference } from "src"
import { FreemiumAvailable, ParticipantSentMessage } from "./constraints"

const constraint = new FreemiumAvailable().and(new ParticipantSentMessage())

const freemiumSituationMapper = new FreemiumSituationMapper()

const freemiumBehavior = createBehavior({
	constraint,
	situationMapper: freemiumSituationMapper,
	action: inference,
})

export { freemiumBehavior }
