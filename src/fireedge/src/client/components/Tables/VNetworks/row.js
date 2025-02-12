/* ------------------------------------------------------------------------- *
 * Copyright 2002-2022, OpenNebula Project, OpenNebula Systems               *
 *                                                                           *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may   *
 * not use this file except in compliance with the License. You may obtain   *
 * a copy of the License at                                                  *
 *                                                                           *
 * http://www.apache.org/licenses/LICENSE-2.0                                *
 *                                                                           *
 * Unless required by applicable law or agreed to in writing, software       *
 * distributed under the License is distributed on an "AS IS" BASIS,         *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  *
 * See the License for the specific language governing permissions and       *
 * limitations under the License.                                            *
 * ------------------------------------------------------------------------- */
import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'

import api from 'client/features/OneApi/network'
import { NetworkCard } from 'client/components/Cards'

const Row = memo(
  ({ original, value, onClickLabel, ...props }) => {
    const state = api.endpoints.getVNetworks.useQueryState(undefined, {
      selectFromResult: ({ data = [] }) =>
        data.find((network) => +network.ID === +original.ID),
    })

    const memoNetwork = useMemo(() => state ?? original, [state, original])

    return (
      <NetworkCard
        network={memoNetwork}
        rootProps={props}
        onClickLabel={onClickLabel}
      />
    )
  },
  (prev, next) => prev.className === next.className
)

Row.propTypes = {
  original: PropTypes.object,
  value: PropTypes.object,
  isSelected: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  onClickLabel: PropTypes.func,
}

Row.displayName = 'VirtualNetworkRow'

export default Row
