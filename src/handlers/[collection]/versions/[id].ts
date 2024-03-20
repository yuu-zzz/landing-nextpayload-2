import httpStatus from 'http-status'
import { Response } from 'express'
import { PayloadRequest } from 'payload/dist/types'
import NotFound from 'payload/dist/errors/NotFound'
import { isNumber } from '../../../utilities/isNumber'
import withPayload from '../../../middleware/withPayload'
import withFileUpload from '../../../middleware/fileUpload'
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody'
import i18nMiddleware from '../../../middleware/i18n'
import withAuth from '../../../middleware/authenticate'
import withDataLoader from '../../../middleware/dataLoader'

async function handler(req: PayloadRequest, res: Response) {
  const collectionSlug = typeof req?.query?.collection === 'string' ? req.query.collection : undefined;
  const id = req.query.id as string;
  const depth = isNumber(req?.query?.depth) ? Number(req.query.depth) : undefined;

  switch (req.method) {
    case 'GET': {
      const doc = await req.payload.findVersionByID({
        req,
        collection: collectionSlug,
        id,
        depth,
        overrideAccess: false,
        user: req?.user,
      })

      return res.status(httpStatus.OK).json(doc)
    }

    case 'POST': {
      const doc = await req.payload.restoreVersion({
        collection: collectionSlug,
        id,
        depth,
        overrideAccess: false,
        user: req?.user,
      })

      return res.status(httpStatus.OK).json(doc)
    }
  }

  return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t))
}

export default withPayload(
  withDataLoader(
    withFileUpload(
      convertPayloadJSONBody(
        i18nMiddleware(
          withAuth(
            handler
          )
        )
      )
    )
  )
)