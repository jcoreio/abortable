import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

process.on('unhandledRejection', () => {
  throw new Error('unhandled rejection!')
})
