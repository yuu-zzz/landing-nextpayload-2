import { PayloadRequest } from 'payload/dist/types'
import { Response } from 'express'
import httpStatus from 'http-status'
import NotFound from 'payload/dist/errors/NotFound'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import graphQLHandler from 'payload/dist/graphql/graphQLHandler'
import withPayload from '../middleware/withPayload'
import authenticate from '../middleware/authenticate'
import i18n from '../middleware/i18n'
import withDataLoader from '../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response, next) {
  try {
    req.payloadAPI = 'GraphQL'

    if (req.method === 'POST') {
      return graphQLHandler(req, res)(req, res, next)
    }

    if (req.method === 'OPTIONS') {
      res.status(httpStatus.OK)
    }
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }

  return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t))
}

export default withPayload(
  withDataLoader(
    i18n(
      authenticate(
        handler
      )
    )
  )
)
