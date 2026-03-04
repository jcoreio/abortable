import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-console
  console.error('unhandled rejection', error)
  throw new Error('unhandled rejection!')
})
