import PropTypes from 'prop-types'

const types = { ...PropTypes }

types.store = PropTypes.shape({
  state: PropTypes.object.isRequired,
  subscribe: PropTypes.func.isRequired,
})

export default types
